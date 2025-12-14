import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import { RedisService } from './RedisService';
import { BMWIntelligence } from './BMWIntelligence';
import logger from '../utils/logger';

export interface VehicleInfo {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineSize: string;
  fuelType: string;
  power: string;
  co2Emissions: string;
  euroClass: string;
  vehicleClass: string;
  mass: string;
  seats: number;
  nextInspection: string;
  taxClass: string;
  bmwSpecific?: {
    engineCode: string;
    generation: string;
    chassisCode: string;
    recommendedOil: string;
    oilCapacity: string;
    serviceIntervals: string;
    commonIssues: string[];
    estimatedValue: string;
    partsPriceLevel: 'Low' | 'Medium' | 'High' | 'Premium';
  };
  dataSource: 'traficom' | '02rekkari' | 'cache';
  timestamp: string;
  confidence: number;
}

export class VehicleLookupService {
  private static browser: Browser | null = null;
  private static readonly TRAFICOM_URL = 'https://www.traficom.fi/en/transport/drivers-and-vehicles/buying-and-selling-vehicle/check-vehicle-information';
  private static readonly CACHE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
  private static readonly REKKARI_API_URL = 'https://02rekkari.fi/api/vehicle';
  private static readonly MAX_RETRIES = 3;

  /**
   * Initialize the browser for web scraping
   */
  static async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
          ]
        });
        logger.info('Puppeteer browser initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize browser:', error);
        throw new Error('Browser initialization failed');
      }
    }
  }

  /**
   * Main method to lookup vehicle information
   */
  static async lookupVehicle(registrationNumber: string): Promise<VehicleInfo> {
    const cleanRegNumber = this.cleanRegistrationNumber(registrationNumber);
    const cacheKey = `vehicle:${cleanRegNumber}`;

    try {
      // Check cache first
      const cachedData = await RedisService.get(cacheKey);
      if (cachedData) {
        logger.info(`Vehicle data found in cache for ${cleanRegNumber}`);
        const vehicleInfo = JSON.parse(cachedData) as VehicleInfo;
        vehicleInfo.dataSource = 'cache';
        return vehicleInfo;
      }

      // Try Traficom scraping first (free)
      let vehicleInfo = await this.scrapeTraficom(cleanRegNumber);

      // If Traficom fails, try 02 Rekkari API (paid fallback)
      if (!vehicleInfo) {
        logger.warn(`Traficom scraping failed for ${cleanRegNumber}, trying 02 Rekkari`);
        vehicleInfo = await this.query02Rekkari(cleanRegNumber);
      }

      if (!vehicleInfo) {
        throw new Error(`No vehicle data found for registration number: ${cleanRegNumber}`);
      }

      // Enhance with BMW-specific data if it's a BMW
      if (vehicleInfo.make.toLowerCase().includes('bmw')) {
        vehicleInfo.bmwSpecific = await BMWIntelligence.getVehicleIntelligence(vehicleInfo);
        vehicleInfo.confidence = Math.min(vehicleInfo.confidence + 0.1, 1.0);
      }

      // Cache the result
      await RedisService.setWithTTL(cacheKey, JSON.stringify(vehicleInfo), this.CACHE_TTL);
      
      logger.info(`Vehicle lookup completed successfully for ${cleanRegNumber}`);
      return vehicleInfo;

    } catch (error) {
      logger.error(`Vehicle lookup failed for ${cleanRegNumber}:`, error);
      throw error;
    }
  }

  /**
   * Scrape vehicle data from Traficom website
   */
  private static async scrapeTraficom(registrationNumber: string): Promise<VehicleInfo | null> {
    let page: Page | null = null;
    
    try {
      await this.initializeBrowser();
      if (!this.browser) throw new Error('Browser not initialized');

      page = await this.browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Navigate to Traficom search page
      await page.goto(this.TRAFICOM_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for and fill the registration number input
      await page.waitForSelector('input[name="registrationNumber"], input[id*="reg"], input[placeholder*="rekisteri"]', { timeout: 10000 });
      
      // Try multiple possible selectors for the input field
      const inputSelectors = [
        'input[name="registrationNumber"]',
        'input[id*="reg"]',
        'input[placeholder*="rekisteri"]',
        'input[type="text"]'
      ];
      
      let inputFound = false;
      for (const selector of inputSelectors) {
        try {
          await page.type(selector, registrationNumber);
          inputFound = true;
          break;
        } catch {
          continue;
        }
      }
      
      if (!inputFound) {
        throw new Error('Could not find registration number input field');
      }

      // Submit the form
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:contains("Hae")',
        'button:contains("Search")'
      ];
      
      for (const selector of submitSelectors) {
        try {
          await page.click(selector);
          break;
        } catch {
          continue;
        }
      }

      // Wait for results
      await page.waitForSelector('.vehicle-info, .result, .tiedot', { timeout: 15000 });
      
      // Extract vehicle information
      const vehicleData = await page.evaluate(() => {
        const extractText = (selector: string): string => {
          const element = document.querySelector(selector);
          return element ? element.textContent?.trim() || '' : '';
        };

        const extractFromTable = (label: string): string => {
          const rows = Array.from(document.querySelectorAll('tr, .field, .data-row'));
          for (const row of rows) {
            if (row.textContent?.toLowerCase().includes(label.toLowerCase())) {
              const cells = Array.from(row.querySelectorAll('td, .value, span'));
              if (cells.length > 1) {
                return cells[1].textContent?.trim() || '';
              }
            }
          }
          return '';
        };

        return {
          make: extractFromTable('merkki') || extractFromTable('make') || extractFromTable('valmistaja'),
          model: extractFromTable('malli') || extractFromTable('model') || extractFromTable('mallimerkintä'),
          year: extractFromTable('vuosimalli') || extractFromTable('year') || extractFromTable('käyttöönotto'),
          color: extractFromTable('väri') || extractFromTable('color'),
          engineSize: extractFromTable('sylinteritilavuus') || extractFromTable('engine') || extractFromTable('moottori'),
          fuelType: extractFromTable('käyttövoima') || extractFromTable('fuel') || extractFromTable('polttoaine'),
          power: extractFromTable('teho') || extractFromTable('power') || extractFromTable('kw'),
          co2Emissions: extractFromTable('co2') || extractFromTable('päästö'),
          euroClass: extractFromTable('euro') || extractFromTable('päästöluokka'),
          vehicleClass: extractFromTable('ajoneuvoluokka') || extractFromTable('class'),
          mass: extractFromTable('massa') || extractFromTable('weight') || extractFromTable('paino'),
          seats: extractFromTable('istumapaikka') || extractFromTable('seats') || extractFromTable('paikka'),
          nextInspection: extractFromTable('katsastus') || extractFromTable('inspection'),
          taxClass: extractFromTable('veroluokka') || extractFromTable('tax')
        };
      });

      // Validate that we got meaningful data
      if (!vehicleData.make || !vehicleData.model) {
        logger.warn(`Incomplete vehicle data from Traficom for ${registrationNumber}`);
        return null;
      }

      const vehicleInfo: VehicleInfo = {
        registrationNumber,
        make: vehicleData.make,
        model: vehicleData.model,
        year: parseInt(vehicleData.year) || 0,
        color: vehicleData.color,
        engineSize: vehicleData.engineSize,
        fuelType: vehicleData.fuelType,
        power: vehicleData.power,
        co2Emissions: vehicleData.co2Emissions,
        euroClass: vehicleData.euroClass,
        vehicleClass: vehicleData.vehicleClass,
        mass: vehicleData.mass,
        seats: parseInt(vehicleData.seats) || 0,
        nextInspection: vehicleData.nextInspection,
        taxClass: vehicleData.taxClass,
        dataSource: 'traficom',
        timestamp: new Date().toISOString(),
        confidence: 0.9
      };

      logger.info(`Successfully scraped Traficom data for ${registrationNumber}`);
      return vehicleInfo;

    } catch (error) {
      logger.error(`Traficom scraping failed for ${registrationNumber}:`, error);
      return null;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Query 02 Rekkari API as fallback (paid service)
   */
  private static async query02Rekkari(registrationNumber: string): Promise<VehicleInfo | null> {
    try {
      if (!process.env.REKKARI_API_KEY) {
        logger.warn('02 Rekkari API key not configured');
        return null;
      }

      const response = await axios.get(`${this.REKKARI_API_URL}/${registrationNumber}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REKKARI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.vehicle) {
        const data = response.data.vehicle;
        
        const vehicleInfo: VehicleInfo = {
          registrationNumber,
          make: data.make || '',
          model: data.model || '',
          year: data.year || 0,
          color: data.color || '',
          engineSize: data.engineSize || '',
          fuelType: data.fuelType || '',
          power: data.power || '',
          co2Emissions: data.co2Emissions || '',
          euroClass: data.euroClass || '',
          vehicleClass: data.vehicleClass || '',
          mass: data.mass || '',
          seats: data.seats || 0,
          nextInspection: data.nextInspection || '',
          taxClass: data.taxClass || '',
          dataSource: '02rekkari',
          timestamp: new Date().toISOString(),
          confidence: 0.95
        };

        logger.info(`Successfully retrieved 02 Rekkari data for ${registrationNumber}`);
        return vehicleInfo;
      }

      return null;
    } catch (error) {
      logger.error(`02 Rekkari API failed for ${registrationNumber}:`, error);
      return null;
    }
  }

  /**
   * Clean and validate registration number format
   */
  private static cleanRegistrationNumber(regNumber: string): string {
    // Remove spaces, hyphens, and convert to uppercase
    const cleaned = regNumber.replace(/[\s-]/g, '').toUpperCase();
    
    // Validate Finnish registration number format (ABC-123 or similar)
    if (!/^[A-Z]{1,3}\d{1,3}[A-Z]?$/.test(cleaned)) {
      logger.warn(`Invalid registration number format: ${regNumber}`);
    }
    
    return cleaned;
  }

  /**
   * Get cached vehicle data without lookup
   */
  static async getCachedVehicle(registrationNumber: string): Promise<VehicleInfo | null> {
    const cleanRegNumber = this.cleanRegistrationNumber(registrationNumber);
    const cacheKey = `vehicle:${cleanRegNumber}`;
    
    try {
      const cachedData = await RedisService.get(cacheKey);
      if (cachedData) {
        const vehicleInfo = JSON.parse(cachedData) as VehicleInfo;
        vehicleInfo.dataSource = 'cache';
        return vehicleInfo;
      }
    } catch (error) {
      logger.error(`Failed to get cached vehicle data for ${cleanRegNumber}:`, error);
    }
    
    return null;
  }

  /**
   * Clear cache for specific vehicle
   */
  static async clearVehicleCache(registrationNumber: string): Promise<void> {
    const cleanRegNumber = this.cleanRegistrationNumber(registrationNumber);
    const cacheKey = `vehicle:${cleanRegNumber}`;
    
    try {
      await RedisService.del(cacheKey);
      logger.info(`Cache cleared for vehicle ${cleanRegNumber}`);
    } catch (error) {
      logger.error(`Failed to clear cache for vehicle ${cleanRegNumber}:`, error);
    }
  }

  /**
   * Graceful shutdown - close browser
   */
  static async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed successfully');
    }
  }
}
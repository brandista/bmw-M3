import { VehicleInfo } from './VehicleLookupService';
import { RedisService } from './RedisService';
import logger from '../utils/logger';

interface BMWModel {
  series: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engineCode: string;
  generation: string;
  chassisCode: string;
  recommendedOil: string;
  oilCapacity: string;
  serviceIntervals: string;
  commonIssues: string[];
  estimatedValue: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  partsPriceLevel: 'Low' | 'Medium' | 'High' | 'Premium';
  specialNotes?: string;
}

export class BMWIntelligence {
  private static bmwDatabase: Map<string, BMWModel[]> = new Map();
  private static initialized = false;

  /**
   * Initialize BMW intelligence database
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadBMWDatabase();
      this.initialized = true;
      logger.info('BMW Intelligence initialized with database');
    } catch (error) {
      logger.error('Failed to initialize BMW Intelligence:', error);
      throw error;
    }
  }

  /**
   * Get BMW-specific intelligence for a vehicle
   */
  static async getVehicleIntelligence(vehicleInfo: VehicleInfo | { make: string; model: string; year?: number; modelYear?: number }) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Normalisoi year/modelYear
      const year: number = ('year' in vehicleInfo ? vehicleInfo.year : vehicleInfo.modelYear) || 0;
      
      const cacheKey = `bmw:${vehicleInfo.make}:${vehicleInfo.model}:${year}`;
      
      // Check cache first
      const cached = await RedisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Find matching BMW model
      const modelKey = `${vehicleInfo.model}`.toLowerCase().replace(/\s+/g, '');
      const models = this.bmwDatabase.get(modelKey) || [];
      
      const matchingModel = models.find(model => 
        year && year >= model.yearStart && year <= model.yearEnd
      );

      if (!matchingModel) {
        // Generic BMW data for unknown models
        const vehicleInfoForGeneric: VehicleInfo = {
          registrationNumber: '',
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          year: year || 0,
          color: '',
          engineSize: '',
          fuelType: '',
          power: '',
          co2Emissions: '',
          euroClass: '',
          vehicleClass: '',
          mass: '',
          seats: 0,
          nextInspection: '',
          taxClass: '',
          dataSource: 'cache',
          timestamp: new Date().toISOString(),
          confidence: 0.5
        };
        const genericIntelligence = this.getGenericBMWIntelligence(vehicleInfoForGeneric);
        await RedisService.setWithTTL(cacheKey, JSON.stringify(genericIntelligence), 24 * 60 * 60);
        return genericIntelligence;
      }

      // Calculate estimated current value based on age and condition
      const currentValue = this.calculateCurrentValue(matchingModel, year || 0);

      const intelligence = {
        engineCode: matchingModel.engineCode,
        generation: matchingModel.generation,
        chassisCode: matchingModel.chassisCode,
        recommendedOil: matchingModel.recommendedOil,
        oilCapacity: matchingModel.oilCapacity,
        serviceIntervals: matchingModel.serviceIntervals,
        commonIssues: matchingModel.commonIssues,
        estimatedValue: currentValue,
        partsPriceLevel: matchingModel.partsPriceLevel,
        specialNotes: matchingModel.specialNotes
      };

      // Cache for 24 hours
      await RedisService.setWithTTL(cacheKey, JSON.stringify(intelligence), 24 * 60 * 60);
      
      return intelligence;

    } catch (error) {
      logger.error('Failed to get BMW intelligence:', error);
      const year: number = ('year' in vehicleInfo ? vehicleInfo.year : vehicleInfo.modelYear) || 0;
      const vehicleInfoForGeneric: VehicleInfo = {
        registrationNumber: '',
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: year,
        color: '',
        engineSize: '',
        fuelType: '',
        power: '',
        co2Emissions: '',
        euroClass: '',
        vehicleClass: '',
        mass: '',
        seats: 0,
        nextInspection: '',
        taxClass: '',
        dataSource: 'cache',
        timestamp: new Date().toISOString(),
        confidence: 0.5
      };
      return this.getGenericBMWIntelligence(vehicleInfoForGeneric);
    }
  }

  /**
   * Get service recommendations based on mileage and last service
   */
  static getServiceRecommendations(vehicleInfo: VehicleInfo, mileage?: number): string[] {
    const recommendations: string[] = [];
    const age = new Date().getFullYear() - vehicleInfo.year;

    // Age-based recommendations
    if (age > 10) {
      recommendations.push('Comprehensive inspection recommended due to vehicle age');
      recommendations.push('Check timing chain/belt condition');
      recommendations.push('Inspect cooling system thoroughly');
    }

    if (age > 15) {
      recommendations.push('Consider preventive replacement of wear parts');
      recommendations.push('Check engine mounts and suspension components');
    }

    // Mileage-based recommendations
    if (mileage) {
      if (mileage > 100000) {
        recommendations.push('High-mileage oil change interval recommended');
        recommendations.push('Inspect transmission fluid');
      }
      
      if (mileage > 150000) {
        recommendations.push('Consider timing chain inspection');
        recommendations.push('Check turbocharger condition (if equipped)');
      }
      
      if (mileage > 200000) {
        recommendations.push('Comprehensive engine diagnostics recommended');
        recommendations.push('Consider preventive maintenance of high-wear components');
      }
    }

    // BMW-specific recommendations
    recommendations.push('Use only BMW-approved oils and fluids');
    recommendations.push('Regular diagnostic scan for BMW-specific fault codes');

    return recommendations;
  }

  /**
   * Get estimated repair cost for common BMW issues
   */
  static getRepairCostEstimate(issue: string): { min: number; max: number; description: string } {
    const repairCosts: Record<string, { min: number; max: number; description: string }> = {
      'oil_change': { min: 150, max: 300, description: 'Standard oil and filter change with BMW-approved oil' },
      'brake_pads': { min: 400, max: 800, description: 'Front or rear brake pad replacement' },
      'brake_discs': { min: 600, max: 1200, description: 'Brake disc replacement (pair)' },
      'timing_chain': { min: 2000, max: 4500, description: 'Timing chain and guides replacement' },
      'water_pump': { min: 800, max: 1500, description: 'Water pump replacement' },
      'thermostat': { min: 300, max: 600, description: 'Thermostat housing replacement' },
      'spark_plugs': { min: 200, max: 400, description: 'Spark plug replacement (set of 4-8)' },
      'air_filter': { min: 80, max: 150, description: 'Engine air filter replacement' },
      'cabin_filter': { min: 60, max: 120, description: 'Cabin/pollen filter replacement' },
      'battery': { min: 200, max: 500, description: 'BMW battery replacement and coding' },
      'alternator': { min: 800, max: 1500, description: 'Alternator replacement' },
      'starter': { min: 600, max: 1200, description: 'Starter motor replacement' },
      'suspension': { min: 500, max: 1500, description: 'Suspension component replacement (per corner)' },
      'transmission_service': { min: 400, max: 800, description: 'Automatic transmission service' },
      'differential_service': { min: 250, max: 450, description: 'Differential oil change' }
    };

    return repairCosts[issue] || { min: 200, max: 1000, description: 'General repair estimate' };
  }

  /**
   * Load BMW database with model-specific information
   */
  private static async loadBMWDatabase(): Promise<void> {
    const bmwModels: BMWModel[] = [
      // 3 Series E46 (1998-2006)
      {
        series: '3',
        model: '318i',
        yearStart: 1998,
        yearEnd: 2006,
        engineCode: 'M43B19',
        generation: 'E46',
        chassisCode: 'E46',
        recommendedOil: 'BMW Longlife-01 5W-30',
        oilCapacity: '4.25L',
        serviceIntervals: 'Every 15,000 km or 1 year',
        commonIssues: [
          'Cooling system plastic parts failure',
          'Window regulator failure',
          'Door handle breaking',
          'Subframe mounting points corrosion'
        ],
        estimatedValue: {
          excellent: 8000,
          good: 6000,
          fair: 4000,
          poor: 2000
        },
        partsPriceLevel: 'Medium'
      },
      {
        series: '3',
        model: '320i',
        yearStart: 1998,
        yearEnd: 2006,
        engineCode: 'M52B20/M54B22',
        generation: 'E46',
        chassisCode: 'E46',
        recommendedOil: 'BMW Longlife-01 5W-30',
        oilCapacity: '6.5L',
        serviceIntervals: 'Every 15,000 km or 1 year',
        commonIssues: [
          'VANOS system failure',
          'Cooling system issues',
          'Window regulator failure',
          'Subframe mounting points'
        ],
        estimatedValue: {
          excellent: 12000,
          good: 9000,
          fair: 6000,
          poor: 3000
        },
        partsPriceLevel: 'Medium'
      },
      // 3 Series E90 (2005-2013)
      {
        series: '3',
        model: '320i',
        yearStart: 2005,
        yearEnd: 2013,
        engineCode: 'N46B20/N43B20',
        generation: 'E90',
        chassisCode: 'E90/E91/E92/E93',
        recommendedOil: 'BMW Longlife-04 5W-30',
        oilCapacity: '6.5L',
        serviceIntervals: 'Every 20,000 km or 2 years',
        commonIssues: [
          'Timing chain stretch',
          'High pressure fuel pump failure',
          'Water pump failure',
          'Thermostat housing cracking'
        ],
        estimatedValue: {
          excellent: 15000,
          good: 12000,
          fair: 8000,
          poor: 5000
        },
        partsPriceLevel: 'High'
      },
      // 5 Series E60 (2003-2010)
      {
        series: '5',
        model: '520i',
        yearStart: 2003,
        yearEnd: 2010,
        engineCode: 'M54B22/N43B20',
        generation: 'E60',
        chassisCode: 'E60/E61',
        recommendedOil: 'BMW Longlife-04 5W-30',
        oilCapacity: '6.5L',
        serviceIntervals: 'Every 20,000 km or 2 years',
        commonIssues: [
          'iDrive system failures',
          'Air suspension problems',
          'Electronic parking brake issues',
          'Timing chain problems'
        ],
        estimatedValue: {
          excellent: 18000,
          good: 14000,
          fair: 10000,
          poor: 6000
        },
        partsPriceLevel: 'High'
      },
      // X3 E83 (2003-2010)
      {
        series: 'X',
        model: 'X3',
        yearStart: 2003,
        yearEnd: 2010,
        engineCode: 'M54B25/N52B25',
        generation: 'E83',
        chassisCode: 'E83',
        recommendedOil: 'BMW Longlife-04 5W-30',
        oilCapacity: '6.5L',
        serviceIntervals: 'Every 20,000 km or 2 years',
        commonIssues: [
          'Transfer case failure',
          'Rear differential problems',
          'Cooling system issues',
          'Suspension wear'
        ],
        estimatedValue: {
          excellent: 16000,
          good: 12000,
          fair: 8000,
          poor: 5000
        },
        partsPriceLevel: 'High'
      }
    ];

    // Group models by model name for quick lookup
    for (const model of bmwModels) {
      const key = model.model.toLowerCase().replace(/\s+/g, '');
      if (!this.bmwDatabase.has(key)) {
        this.bmwDatabase.set(key, []);
      }
      this.bmwDatabase.get(key)!.push(model);
    }

    logger.info(`Loaded ${bmwModels.length} BMW models into intelligence database`);
  }

  /**
   * Calculate current estimated value based on age and market conditions
   */
  private static calculateCurrentValue(model: BMWModel, year: number): string {
    const age = new Date().getFullYear() - year;
    const depreciationFactor = Math.max(0.3, 1 - (age * 0.08)); // Minimum 30% of original value
    
    const currentValues = {
      excellent: Math.round(model.estimatedValue.excellent * depreciationFactor),
      good: Math.round(model.estimatedValue.good * depreciationFactor),
      fair: Math.round(model.estimatedValue.fair * depreciationFactor),
      poor: Math.round(model.estimatedValue.poor * depreciationFactor)
    };

    return `€${currentValues.excellent} (excellent) - €${currentValues.poor} (poor condition)`;
  }

  /**
   * Get generic BMW intelligence for unknown models
   */
  private static getGenericBMWIntelligence(vehicleInfo: VehicleInfo) {
    const age = new Date().getFullYear() - vehicleInfo.year;
    
    return {
      engineCode: 'Unknown - Check VIN decoder',
      generation: 'Unknown generation',
      chassisCode: 'Unknown chassis',
      recommendedOil: age > 15 ? 'BMW Longlife-01 5W-30' : 'BMW Longlife-04 5W-30',
      oilCapacity: '4.5-6.5L (model dependent)',
      serviceIntervals: age > 15 ? 'Every 10,000 km or 1 year' : 'Every 20,000 km or 2 years',
      commonIssues: [
        'Cooling system maintenance required',
        'Regular diagnostic scan recommended',
        'Check BMW-specific service bulletins',
        'Monitor for software updates'
      ],
      estimatedValue: 'Market research required for accurate valuation',
      partsPriceLevel: 'High' as const
    };
  }

  /**
   * Get maintenance schedule for BMW vehicle
   */
  static getMaintenanceSchedule(vehicleInfo: VehicleInfo, currentMileage: number = 0) {
    const age = new Date().getFullYear() - vehicleInfo.year;
    const schedule = [];

    // Basic maintenance intervals
    const oilChangeInterval = age > 10 ? 10000 : 15000;
    const nextOilChange = Math.ceil(currentMileage / oilChangeInterval) * oilChangeInterval;
    
    schedule.push({
      service: 'Oil & Filter Change',
      nextDue: nextOilChange,
      priority: 'High',
      estimatedCost: '€150-300'
    });

    // Age-based scheduling
    if (currentMileage > 60000) {
      schedule.push({
        service: 'Spark Plugs',
        nextDue: Math.ceil(currentMileage / 60000) * 60000,
        priority: 'Medium',
        estimatedCost: '€200-400'
      });
    }

    if (currentMileage > 80000) {
      schedule.push({
        service: 'Brake Fluid',
        nextDue: Math.ceil(currentMileage / 40000) * 40000,
        priority: 'High',
        estimatedCost: '€80-150'
      });
    }

    return schedule;
  }
}
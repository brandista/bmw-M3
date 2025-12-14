import { Router } from 'express';
import { TraficomService } from '../services/TraficomService';
import { BMWIntelligence } from '../services/BMWIntelligence';
import { RedisService } from '../services/RedisService';
import { z } from 'zod';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Validation schema
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  messages: Message[];
  vehicleData?: any;
}

/**
 * POST /api/v2/chat
 * Yksinkertaistettu chat endpoint BMW-bottia varten
 */
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = ChatRequestSchema.parse(req.body);
    
    logger.info(`Chat message received: ${message.substring(0, 50)}...`);
    
    // Hae tai luo sessio
    let session: ChatSession;
    const newSessionId = sessionId || uuidv4();
    
    if (sessionId) {
      const cached = await RedisService.get(`chat:${sessionId}`);
      session = cached ? JSON.parse(cached) : { sessionId: newSessionId, messages: [] };
    } else {
      session = { sessionId: newSessionId, messages: [] };
    }
    
    // Lisää käyttäjän viesti
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
    
    // Tarkista onko viestissä rekisterinumero
    const regNumberMatch = message.match(/\b[A-Z]{2,3}-?\d{1,4}\b/i);
    
    let botResponse = '';
    
    if (regNumberMatch) {
      const regNumber = regNumberMatch[0];
      
      if (TraficomService.validateRegistrationNumber(regNumber)) {
        try {
          const vehicleData = await TraficomService.getVehicleData(regNumber);
          
          if (vehicleData && vehicleData.make === 'BMW') {
            // Tallenna ajoneuvotiedot sessioon
            session.vehicleData = vehicleData;
            
            // Hae BMW-spesifistä dataa
            const bmwIntelligence = await BMWIntelligence.getVehicleIntelligence(vehicleData);
            
            botResponse = `Loistavaa! Löysin ajoneuvosi tiedot:

🚗 **${vehicleData.make} ${vehicleData.model}** (${vehicleData.modelYear})
📅 Ensimmäinen rekisteröinti: ${vehicleData.firstRegistration}
⛽ Käyttövoima: ${vehicleData.fuelType}
🔧 Moottori: ${vehicleData.engineDisplacement}cc, ${vehicleData.enginePower} kW
📊 CO2: ${vehicleData.co2Emissions} g/km
🏃 Kilometrit: ${vehicleData.odometer ? `${vehicleData.odometer.toLocaleString('fi-FI')} km` : 'Ei tiedossa'}
🔍 Seuraava katsastus: ${vehicleData.inspectionExpiry || 'Ei tiedossa'}

**BMW-spesifiset tiedot:**
${bmwIntelligence.chassisCode ? `• Alusta: ${bmwIntelligence.chassisCode}` : ''}
${bmwIntelligence.engineCode ? `• Moottorikoodi: ${bmwIntelligence.engineCode}` : ''}
• Suositeltu öljy: ${bmwIntelligence.recommendedOil}
• Öljymäärä: ${bmwIntelligence.oilCapacity}
• Huoltoväli: ${bmwIntelligence.serviceIntervals}

**Yleisiä ongelmia tässä mallissa:**
${bmwIntelligence.commonIssues?.map((issue: string) => `• ${issue}`).join('\n') || 'Ei tiedossa'}

Voinko auttaa sinua huoltotarpeen arvioinnissa tai varauksessa? 📅`;
            
          } else if (vehicleData) {
            // Ei-BMW auto
            botResponse = `Löysin ajoneuvon ${regNumber}, mutta se on ${vehicleData.make} ${vehicleData.model}. 

Olemme erikoistuneet BMW-merkkisten autojen huoltoon ja korjauksiin. Voimme kuitenkin palvella myös muita merkkejä - ota yhteyttä suoraan puhelimitse: **050 547 7779** tai sähköpostilla, niin jutellaan lisää!`;
            
          } else {
            botResponse = `Valitettavasti en löytänyt tietoja rekisterinumerolla ${regNumber}. Tarkista että numero on oikein kirjoitettu (esim. ABC-123).`;
          }
          
        } catch (error) {
          logger.error('Error processing vehicle lookup:', error);
          botResponse = 'Anteeksi, tapahtui virhe haettaessa ajoneuvotietoja. Yritä hetken kuluttua uudelleen tai soita meille: 050 547 7779';
        }
      } else {
        botResponse = 'Rekisterinumero näyttää olevan virheellisessä muodossa. Suomalainen rekisterinumero on muotoa ABC-123 tai AB-1234.';
      }
      
    } else if (message.toLowerCase().includes('varaus') || message.toLowerCase().includes('aika')) {
      botResponse = `Varaa aika huoltoon tai korjaukseen:

📞 **Soita:** 050 547 7779 (ma-pe 8-17)
📧 **Sähköposti:** [email protected]
📍 **Osoite:** [Lisää osoite]

Voit myös antaa rekisterinumerosi, niin voin hakea autosi tiedot ja arvioida huoltotarpeen!`;
      
    } else if (message.toLowerCase().includes('hinta') || message.toLowerCase().includes('hinnat')) {
      botResponse = `Hinnoittelumme on reilu ja läpinäkyvä:

💶 **Työtuntihinta: 89€/h** (alv 0%)

**Yleisimmät huollot:**
• Öljynvaihto: 150-300€
• Jarrut (levyt + palat): 600-1200€
• Jarruneste: 80-150€
• Ilmansuodatin: 80-150€
• Sähköinen diagnoosi: sisältyy huoltoon

Isommat työt sovitaan aina erikseen ja annamme tarkan kustannusarvion ennen töiden aloitusta. 

Anna rekisterinumerosi, niin voin antaa tarkemman arvion autosi huoltotarpeesta! 🔧`;
      
    } else if (message.toLowerCase().includes('bmw') || message.toLowerCase().includes('erikois')) {
      botResponse = `Olemme BMW-erikoiskorjaamo Helsingissä! 🏎️

**Miksi valita meidät:**
• Yli [X] vuoden kokemus BMW-autoista
• BMW-spesifit työkalut ja diagnoostilaitteet
• Aidon BMW-osien käyttö
• Sähköisen huoltokirjan päivitys
• Henkilökohtainen palvelu

**Huollamme kaikki BMW-mallit:**
• 1-, 2-, 3-, 4-, 5-, 6-, 7-sarja
• X-mallit (X1, X3, X5, X7)
• M-mallit
• i-mallit (sähkö/hybridi)

Anna autosi rekisterinumero, niin haen tarkat tiedot ja huoltohistorian!`;
      
    } else {
      // Yleinen vastaus
      botResponse = `Hei! Olen Bemufixin virtuaalinen assistentti. 👋

Voin auttaa sinua:
• 🔍 Ajoneuvotietojen haussa (anna rekisterinumero)
• 🔧 Huoltotarpeen arvioinnissa
• 📅 Ajan varaamisessa
• 💶 Hintatietojen antamisessa

**Aloitetaan:** Anna autosi rekisterinumero (esim. ABC-123), niin haen tiedot ja kerron mitä autosi tarvitsee!

Tai kysy suoraan esim:
- "Paljonko maksaa öljynvaihto?"
- "Haluan varata ajan"
- "Mitä BMW-erikoisuuksia teillä on?"`;
    }
    
    // Lisää botin vastaus
    session.messages.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString(),
    });
    
    // Tallenna sessio Redisiin (1 tunti)
    await RedisService.setWithTTL(
      `chat:${session.sessionId}`,
      JSON.stringify(session),
      3600
    );
    
    res.json({
      sessionId: session.sessionId,
      message: botResponse,
      timestamp: new Date().toISOString(),
      vehicleData: session.vehicleData || null,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    
    logger.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v2/chat/:sessionId
 * Hae chat-sessio
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const cached = await RedisService.get(`chat:${sessionId}`);
    
    if (!cached) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = JSON.parse(cached);
    res.json(session);
    
  } catch (error) {
    logger.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

# Bemufix Landing Page + Chat Widget 🚗

Moderni BMW-erikoiskorjaamon landing page + älykkä chat-widget integraatiolla.

## 🚀 Ominaisuudet

- **Modern Landing Page**: Hero, Services, About, Contact
- **Chat Widget**: Floating BMW chatbot popup
- **Real-time API Integration**: Yhteys backend-palveluun
- **Responsive Design**: Toimii kaikilla laitteilla
- **Smooth Animations**: Framer Motion animaatiot
- **shadcn/ui Components**: Laadukkaat UI-komponentit
- **TypeScript**: Täysi tyyppiturva

## 📋 Vaatimukset

- Node.js >= 18.0.0
- npm tai yarn

## 🛠️ Asennus

1. Kloonaa repo:
\`\`\`bash
git clone <repo-url>
cd bemufix12
\`\`\`

2. Asenna riippuvuudet:
\`\`\`bash
npm install
\`\`\`

3. Kopioi .env.example -> .env:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Muokkaa .env tiedostoa:
\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`

5. Käynnistä development server:
\`\`\`bash
npm run dev
\`\`\`

Frontend pyörii nyt osoitteessa: http://localhost:5173

## 🏗️ Rakenne

\`\`\`
src/
├── components/
│   ├── ChatBot.tsx       # Floating chat widget
│   ├── Header.tsx        # Navigation
│   ├── Hero.tsx          # Hero section
│   ├── Services.tsx      # Services grid
│   ├── About.tsx         # About section
│   ├── Contact.tsx       # Contact form
│   └── ui/               # shadcn/ui components
├── pages/
│   ├── Index.tsx         # Main landing page
│   └── NotFound.tsx      # 404 page
├── lib/
│   └── api.ts            # API client
└── App.tsx               # App root
\`\`\`

## 💬 Chat Widget Usage

Chat-widget on floating button sivun oikeassa alakulmassa. 

**Käyttäjä voi:**
- Antaa rekisterinumeron (esim. ABC-123)
- Kysyä hinnoista ja palveluista
- Varata aikaa
- Kysyä BMW-spesifisiä kysymyksiä

**Widget hakee automaattisesti:**
- Ajoneuvotiedot Traficomin rekisteristä
- BMW-spesifiset tekniset tiedot
- Huoltosuositukset
- Yleiset ongelmat mallille

## 🎨 Customization

### Värit

Muokkaa `src/index.css` tiedostossa:
\`\`\`css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  ...
}
\`\`\`

### Yhteystiedot

Päivitä puhelinnumero ja muut tiedot:
- `src/components/Hero.tsx`
- `src/components/Contact.tsx`
- `src/components/Footer.tsx`

### Logo & Kuvat

Vaihda kuvat:
- `src/assets/bmw-hero.png`
- `public/favicon.ico`

## 🚀 Deployment

### Vercel (Suositus)

1. Pushaa koodi GitHubiin
2. Importtaa projekti Verceliin
3. Aseta environment variables:
   - VITE_API_URL (backend URL)
4. Deploy!

### Netlify

1. Pushaa koodi GitHubiin
2. Uusi site Netlifyssä
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   - VITE_API_URL
5. Deploy!

### Custom Server

\`\`\`bash
npm run build
# Serve dist/ folder with nginx/apache
\`\`\`

## 📝 TODO

- [ ] Lisää landing page sisältöä
- [ ] Lisää kuvia/videota
- [ ] SEO optimointi
- [ ] Analytics (Google Analytics / Plausible)
- [ ] A/B testing
- [ ] Multi-language support (EN/FI)

## 🔗 Integration

Backend: [bemufix-ultimate](../bemufix-ultimate)

Varmista että backend pyörii ja VITE_API_URL osoittaa oikeaan paikkaan!

## 📄 License

MIT

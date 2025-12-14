import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import bemuFixLogo from "@/assets/bemufix-logo.avif";

const footerLinks = [
  { label: "Palvelut", href: "#palvelut" },
  { label: "Tietoa meistä", href: "#meista" },
  { label: "Yhteystiedot", href: "#yhteystiedot" },
];

const services = [
  "Määräaikaishuollot",
  "Korjaamotyöt",
  "Vikadiagnoosit",
  "Lisävarusteasennukset",
  "Renkaanvaihto",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white relative overflow-hidden">
      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <motion.a 
                href="#" 
                className="inline-block mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={bemuFixLogo} 
                  alt="BemuFIX" 
                  className="h-12 w-auto brightness-0 invert"
                />
              </motion.a>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Meille auton huolto on muutakin kuin osien vaihtoa! 
                BMW-erikoiskorjaamo Helsingissä.
              </p>
              <div className="flex gap-3">
                <a 
                  href="tel:+358505477779"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:myynti@bemufix.fi"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-5">Navigointi</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-white mb-5">Palvelut</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service}>
                    <span className="text-white/60">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-5">Yhteystiedot</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-white/60">
                    Hankasuontie 7<br />
                    00390 Helsinki
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="tel:+358505477779" className="text-white/60 hover:text-white transition-colors">
                    050 547 7779
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="mailto:myynti@bemufix.fi" className="text-white/60 hover:text-white transition-colors">
                    myynti@bemufix.fi
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm">
                © {currentYear} BemuFIX. Kaikki oikeudet pidätetään.
              </p>
              <p className="text-white/40 text-sm">
                Ma-Pe: 9-18 | La-Su: Sopimuksen mukaan
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

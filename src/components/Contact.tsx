import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, ArrowUpRight } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Puhelin",
    value: "050 547 7779",
    href: "tel:+358505477779",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Mail,
    label: "Sähköposti",
    value: "myynti@bemufix.fi",
    href: "mailto:myynti@bemufix.fi",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: MapPin,
    label: "Osoite",
    value: "Hankasuontie 7, 00390 Helsinki",
    href: "https://maps.google.com/?q=Hankasuontie+7+Helsinki",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Clock,
    label: "Aukioloajat",
    value: "Ma-Pe: 9-18 | La-Su: Sopimuksen mukaan",
    href: null,
    gradient: "from-emerald-500 to-teal-500",
  },
];

export function Contact() {
  return (
    <section id="yhteystiedot" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Ota yhteyttä
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Kuinka voimme{" "}
            <span className="text-gradient">auttaa?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ota rohkeasti yhteyttä - autamme mielellämme kaikissa autoasi koskevissa kysymyksissä!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block group"
                  >
                    <ContactCard {...item} />
                  </a>
                ) : (
                  <ContactCard {...item} />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl bg-white border border-black/5 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Lähetä viesti
            </h3>
            
            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nimi
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Nimesi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Puhelin
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Puhelinnumerosi"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sähköposti
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="sahkoposti@esimerkki.fi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Viesti
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Kerro autostasi ja huoltotarpeesta..."
                />
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              >
                <Send className="w-5 h-5" />
                <span>Lähetä viesti</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon: Icon, label, value, gradient, href }: { 
  icon: any; 
  label: string; 
  value: string; 
  gradient: string;
  href: string | null;
}) {
  return (
    <div className="h-full p-5 rounded-2xl bg-white border border-black/5 shadow-lg hover:shadow-xl transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {href && (
          <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        )}
      </div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-foreground font-medium text-sm leading-relaxed">{value}</div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Wrench, Car, Search, PlusCircle, CircleDot, Euro, ArrowUpRight } from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Määräaikaishuollot",
    description: "Huollamme kaikki autot huolto-ohjelman mukaisesti. Päivitämme myös sähköiset huoltokirjat!",
    gradient: "from-blue-500 to-cyan-500",
    size: "large",
  },
  {
    icon: Car,
    title: "Korjaamotyöt",
    description: "Korjaamme laadukkailla varaosilla työn laadusta tinkimättä.",
    gradient: "from-violet-500 to-purple-500",
    size: "normal",
  },
  {
    icon: Search,
    title: "Vikadiagnoosit",
    description: "Paikannamamme vian alkulähteelle minimoimme turhat osat.",
    gradient: "from-orange-500 to-red-500",
    size: "normal",
  },
  {
    icon: PlusCircle,
    title: "Lisävarusteet",
    description: "Merkkikohtaisten ja kolmansien osapuolten lisävarusteiden asennukset.",
    gradient: "from-emerald-500 to-teal-500",
    size: "normal",
  },
  {
    icon: CircleDot,
    title: "Renkaanvaihto",
    description: "Kokonaisvaltaiset renkaiden asennuspalvelut tasapainoituksineen.",
    gradient: "from-pink-500 to-rose-500",
    size: "normal",
  },
  {
    icon: Euro,
    title: "89€/h",
    description: "Reilu hinnoittelu, ei yllätyksiä. Suuremmat työt sovitaan erikseen.",
    gradient: "from-amber-500 to-orange-500",
    size: "large",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function Services() {
  return (
    <section id="palvelut" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Palvelumme
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Kaikki mitä autosi{" "}
            <span className="text-gradient">tarvitsee</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            "Auton käyttö ja huoltaminen on elinkaariajattelua." Tarjoamme kokonaisvaltaiset 
            huolto- ja korjaamopalvelut ammattitaidolla.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`group relative p-6 lg:p-8 rounded-3xl bg-white border border-black/5 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 cursor-pointer overflow-hidden ${
                service.size === "large" ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Epävarma huoltotarpeesta? Ota yhteyttä niin jutellaan!
          </p>
          <motion.a
            href="tel:+358505477779"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-white font-semibold rounded-2xl hover:bg-foreground/90 transition-colors"
          >
            <span>Soita: 050 547 7779</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

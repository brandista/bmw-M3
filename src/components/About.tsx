import { motion } from "framer-motion";
import { Check, Quote } from "lucide-react";
import heroImage from "@/assets/hero-garage.jpg";

const highlights = [
  "Asiakaslähtöinen palvelu",
  "Kustannustehokkaat ratkaisut",
  "Laadukkaat varaosat",
  "Sähköiset huoltokirjat",
  "BMW-erikoisosaaminen",
  "Kaikki merkit tervetulleita",
];

export function About() {
  return (
    <section id="meista" className="py-24 lg:py-32 relative overflow-hidden bg-foreground">
      {/* Background elements */}
      <div className="absolute inset-0 mesh-gradient-dark opacity-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="BemuFIX korjaamo" 
                className="w-full aspect-[4/3] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-8 -right-8 p-6 rounded-2xl bg-white shadow-2xl max-w-xs"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-3" />
              <p className="text-foreground font-medium italic">
                "Kun haluat tehdä asian hyvin, tee se itse."
              </p>
              <p className="text-muted-foreground text-sm mt-2">— BemuFIX filosofia</p>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl border-2 border-primary/30" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-accent/20 blur-2xl" />
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-primary text-sm font-semibold mb-6">
              Tietoa meistä
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Intohimomme on kulkea{" "}
              <span className="text-gradient">tämä matka</span>{" "}
              kanssasi
            </h2>

            <div className="space-y-5 text-white/70 text-lg leading-relaxed mb-10">
              <p>
                Haluamme pitää aina järjen mukana korjaamotoiminnassamme. Neuvottelemme 
                asiakkaamme kanssa juuri hänen autolleen parhaiten soveltuvista ja 
                mahdollisimman <span className="text-white font-medium">kustannustehokkaista</span> toimenpiteistä.
              </p>
              <p>
                Vanhempien autojen kohdalla tämä voi tarkoittaa vanhan osan korjaamista 
                tai toimivan käytetyn osan hyödyntämistä uuden sijaan.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {highlights.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

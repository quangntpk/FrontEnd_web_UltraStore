
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen pt-32 pb-16 px-6 flex flex-col justify-center relative overflow-hidden">
      <div className="container mx-auto max-w-6xl z-10">
        <div className="inline-block mb-4 animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            Colorful Design
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6 md:mb-8 animate-fade-in opacity-0 gradient-text" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
          Functional simplicity <br className="hidden md:block" />
          meets beautiful design
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in opacity-0" style={{ animationDelay: "600ms", animationFillMode: "forwards" }}>
          Creating a harmonious balance between simplicity and functionality. Every element serves a purpose, delivering a seamless and intuitive experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in opacity-0" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
          <a href="#products" className="inline-flex items-center justify-center h-12 px-6 gradient-bg text-white rounded-full hover:opacity-90 transition-opacity">
            Explore Products
          </a>
          <a href="#about" className="inline-flex items-center justify-center h-12 px-6 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors">
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2/3 h-2/3 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-pink-300/20 to-primary/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;


import { cn } from "@/lib/utils";
import { LucideIcon, Sparkles, Zap, RefreshCw, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay: number;
  colorClass: string;
}

const FeatureCard = ({ title, description, icon: Icon, delay, colorClass }: FeatureCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={cn(
        "p-6 md:p-8 rounded-2xl border border-border colorful-card",
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center mb-5`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const features = [
  {
    title: "abcxyz",
    description: "Clean design that focuses on your content without unnecessary distractions.",
    icon: Sparkles,
    colorClass: "bg-purple-500",
  },
  {
    title: "Lightning Fast",
    description: "Optimized performance with smooth animations and transitions.",
    icon: Zap,
    colorClass: "bg-pink-500",
  },
  {
    title: "Constant Updates",
    description: "Regular improvements and new features to enhance your experience.",
    icon: RefreshCw,
    colorClass: "bg-indigo-500",
  },
  {
    title: "Secure & Reliable",
    description: "Built with security in mind, protecting your data at every step.",
    icon: Shield,
    colorClass: "bg-violet-500",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 gradient-text">Features That Delight</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every detail has been carefully considered to provide a seamless and intuitive experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 100}
              colorClass={feature.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  colorClass: string;
  price: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Premium Experience",
    description: "A beautifully crafted product with attention to every detail.",
    imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ccircle cx='200' cy='150' r='80' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Cpath d='M160 150 Q 200 100, 240 150 T 320 150' stroke='%238B5CF6' fill='transparent' stroke-width='2'/%3E%3C/svg%3E",
    colorClass: "from-purple-500 to-indigo-500",
    price: 199.99,
  },
  {
    id: 2,
    name: "Seamless Integration",
    description: "Works perfectly with your existing tools and workflow.",
    imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Crect x='120' y='100' width='70' height='100' fill='%23D946EF' fill-opacity='0.2'/%3E%3Crect x='210' y='100' width='70' height='100' fill='%23D946EF' fill-opacity='0.2'/%3E%3Cline x1='190' y1='150' x2='210' y2='150' stroke='%23D946EF' stroke-width='2'/%3E%3C/svg%3E",
    colorClass: "from-pink-500 to-rose-500",
    price: 149.99,
  },
  {
    id: 3,
    name: "Intuitive Design",
    description: "Easy to use with a minimal learning curve for all users.",
    imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpolygon points='200,80 240,150 200,220 160,150' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Ccircle cx='200' cy='150' r='30' fill='%23f1f5f9' stroke='%238B5CF6' stroke-width='2'/%3E%3C/svg%3E",
    colorClass: "from-violet-500 to-purple-500",
    price: 129.99,
  }
];

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const addToCart = () => {
    // In a real app, this would add the product to the cart state
    toast.success(`${product.name} added to cart!`);
  };

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
        "rounded-2xl overflow-hidden border border-border colorful-card h-full flex flex-col",
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className={`aspect-video overflow-hidden bg-gradient-to-r ${product.colorClass}`}>
        <img 
          src={product.imageSrc} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 mix-blend-overlay"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-medium">{product.name}</h3>
          <span className="font-medium text-primary">${product.price}</span>
        </div>
        <p className="text-muted-foreground flex-1">{product.description}</p>
        <div className="mt-6 flex gap-2">
          <Link 
            to={`/product/${product.id}`}
            className="text-primary font-medium hover-effect hover:opacity-80"
          >
            View details
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={addToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" /> 
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductShowcase = () => {
  return (
    <section id="products" className="py-24 px-6 bg-gradient-to-b from-white to-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 gradient-text">Our Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our range of thoughtfully designed products that combine elegance with functionality.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/cart">
            <Button size="lg" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;

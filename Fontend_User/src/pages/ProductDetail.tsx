
import { useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag, Star } from "lucide-react";

// Mock product data - in a real app this would come from an API
const products = [
  {
    id: "1",
    name: "Premium Summer Dress",
    description: "A beautiful summer dress made with sustainable fabrics. Perfect for warm days and special occasions.",
    price: 129.99,
    rating: 4.8,
    colors: ["#F8B195", "#F67280", "#C06C84"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M200,150 L250,300 L200,450 L150,300 Z' fill='%23D946EF' fill-opacity='0.2'/%3E%3Crect x='170' y='100' width='60' height='50' fill='%23D946EF' fill-opacity='0.3'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M200,150 L250,300 L200,450 L150,300 Z' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Crect x='170' y='100' width='60' height='50' fill='%238B5CF6' fill-opacity='0.3'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M200,150 L250,300 L200,450 L150,300 Z' fill='%23F67280' fill-opacity='0.2'/%3E%3Crect x='170' y='100' width='60' height='50' fill='%23F67280' fill-opacity='0.3'/%3E%3C/svg%3E",
    ],
    details: [
      "100% sustainable cotton",
      "Ethically manufactured",
      "Adjustable waist tie",
      "Machine washable",
      "Model wears size S"
    ]
  },
  {
    id: "2",
    name: "Designer Casual Shirt",
    description: "A premium casual shirt with a modern cut. Versatile enough for both casual and semi-formal occasions.",
    price: 89.99,
    rating: 4.6,
    colors: ["#355C7D", "#6C5B7B", "#C06C84"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M150,150 L250,150 L250,450 L150,450 Z' fill='%236C5B7B' fill-opacity='0.2'/%3E%3Crect x='170' y='100' width='60' height='50' fill='%236C5B7B' fill-opacity='0.3'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M150,150 L250,150 L250,450 L150,450 Z' fill='%23355C7D' fill-opacity='0.2'/%3E%3Crect x='170' y='100' width='60' height='50' fill='%23355C7D' fill-opacity='0.3'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M150,150 L250,150 L250,450 L150,450 Z' fill='%23C06C84' fill-opacity='0.2'/%3E%3Crect x='170' y='100' width='60' height='50' fill='%23C06C84' fill-opacity='0.3'/%3E%3C/svg%3E",
    ],
    details: [
      "Premium cotton blend",
      "Regular fit",
      "Button-down collar",
      "Machine washable at 30°C",
      "Model wears size M"
    ]
  },
  {
    id: "3",
    name: "Luxury Evening Gown",
    description: "An elegant evening gown perfect for special occasions. Features intricate detailing and a flattering silhouette.",
    price: 249.99,
    rating: 4.9,
    colors: ["#8B5CF6", "#D946EF", "#EC4899"],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M200,100 L230,150 L200,500 L170,150 Z' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Cellipse cx='200' cy='120' rx='30' ry='20' fill='%238B5CF6' fill-opacity='0.3'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M200,100 L230,150 L200,500 L170,150 Z' fill='%23D946EF' fill-opacity='0.2'/%3E%3Cellipse cx='200' cy='120' rx='30' ry='20' fill='%23D946EF' fill-opacity='0.3'/%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M200,100 L230,150 L200,500 L170,150 Z' fill='%23EC4899' fill-opacity='0.2'/%3E%3Cellipse cx='200' cy='120' rx='30' ry='20' fill='%23EC4899' fill-opacity='0.3'/%3E%3C/svg%3E",
    ],
    details: [
      "Premium silk blend",
      "Fitted silhouette",
      "Hand-sewn embellishments",
      "Dry clean only",
      "Model wears size S"
    ]
  }
];

const ProductDetail = () => {
  const { productId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Find the product by ID
  const product = products.find(p => p.id === productId) || products[0];

  return (
    <>
      <Navigation />
      
      <div className="pt-24 pb-16 px-6 min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              
              <div className="flex gap-3 overflow-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "rounded-lg overflow-hidden border-2 min-w-[80px] w-20 aspect-square transition-all",
                      selectedImage === index 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-medium mb-2 gradient-text">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star 
                        key={index} 
                        className={cn(
                          "w-4 h-4", 
                          index < Math.floor(product.rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <p className="text-2xl font-medium text-primary mb-4">${product.price.toFixed(2)}</p>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium mb-3">Colors</h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        selectedColor === index 
                          ? "ring-2 ring-offset-2 ring-primary" 
                          : "ring-1 ring-border hover:ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(index)}
                      aria-label={`Select color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Size</h3>
                  <button className="text-xs text-primary hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={cn(
                        "h-10 min-w-[40px] px-3 rounded border text-sm font-medium transition-all",
                        selectedSize === size 
                          ? "border-primary bg-primary text-white" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium mb-3">Quantity</h3>
                <div className="flex items-center border border-border rounded-md w-32">
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button 
                    className="w-10 h-10 flex items-center justify-center text-lg"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Product Features */}
              <div>
                <h3 className="text-sm font-medium mb-3">Details</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Add to Cart and Wishlist */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button 
                  className="flex-1 h-12 px-6 gradient-bg text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Bag
                </button>
                <button className="h-12 w-12 border border-primary/30 rounded-full hover:bg-primary/5 transition-colors flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Related Products Section */}
          <div className="mt-24">
            <h2 className="text-2xl font-medium mb-8 gradient-text">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.filter(p => p.id !== productId).map((product) => (
                <a 
                  key={product.id} 
                  href={`/product/${product.id}`}
                  className="group rounded-xl overflow-hidden border border-border colorful-card hover:shadow-md transition-all"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-white">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-primary font-medium">${product.price.toFixed(2)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ProductDetail;

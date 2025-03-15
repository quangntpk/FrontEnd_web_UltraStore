import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
interface Product {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  colorClass: string;
  price: number;
  category: string;
}

// Extended product data for the listing page
const products: Product[] = [{
  id: 1,
  name: "Premium Experience",
  description: "A beautifully crafted product with attention to every detail.",
  imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ccircle cx='200' cy='150' r='80' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Cpath d='M160 150 Q 200 100, 240 150 T 320 150' stroke='%238B5CF6' fill='transparent' stroke-width='2'/%3E%3C/svg%3E",
  colorClass: "from-purple-500 to-indigo-500",
  price: 199.99,
  category: "Premium"
}, {
  id: 2,
  name: "Seamless Integration",
  description: "Works perfectly with your existing tools and workflow.",
  imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Crect x='120' y='100' width='70' height='100' fill='%23D946EF' fill-opacity='0.2'/%3E%3Crect x='210' y='100' width='70' height='100' fill='%23D946EF' fill-opacity='0.2'/%3E%3Cline x1='190' y1='150' x2='210' y2='150' stroke='%23D946EF' stroke-width='2'/%3E%3C/svg%3E",
  colorClass: "from-pink-500 to-rose-500",
  price: 149.99,
  category: "Pro"
}, {
  id: 3,
  name: "Intuitive Design",
  description: "Easy to use with a minimal learning curve for all users.",
  imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpolygon points='200,80 240,150 200,220 160,150' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Ccircle cx='200' cy='150' r='30' fill='%23f1f5f9' stroke='%238B5CF6' stroke-width='2'/%3E%3C/svg%3E",
  colorClass: "from-violet-500 to-purple-500",
  price: 129.99,
  category: "Standard"
}, {
  id: 4,
  name: "Advanced Analytics",
  description: "Gain deep insights into your data with powerful analytics tools.",
  imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cline x1='100' y1='200' x2='150' y2='150' stroke='%234ADE80' stroke-width='2'/%3E%3Cline x1='150' y1='150' x2='200' y2='180' stroke='%234ADE80' stroke-width='2'/%3E%3Cline x1='200' y1='180' x2='250' y2='120' stroke='%234ADE80' stroke-width='2'/%3E%3Cline x1='250' y1='120' x2='300' y2='100' stroke='%234ADE80' stroke-width='2'/%3E%3Ccircle cx='100' cy='200' r='5' fill='%234ADE80'/%3E%3Ccircle cx='150' cy='150' r='5' fill='%234ADE80'/%3E%3Ccircle cx='200' cy='180' r='5' fill='%234ADE80'/%3E%3Ccircle cx='250' cy='120' r='5' fill='%234ADE80'/%3E%3Ccircle cx='300' cy='100' r='5' fill='%234ADE80'/%3E%3C/svg%3E",
  colorClass: "from-green-500 to-emerald-500",
  price: 179.99,
  category: "Pro"
}, {
  id: 5,
  name: "Cloud Storage",
  description: "Secure and scalable cloud storage for all your needs.",
  imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpath d='M150,180 Q200,120 250,180 T350,180 Q350,220 300,240 Q250,260 200,240 Q150,220 150,180 Z' fill='%230EA5E9' fill-opacity='0.2' stroke='%230EA5E9' stroke-width='2'/%3E%3C/svg%3E",
  colorClass: "from-blue-500 to-cyan-500",
  price: 99.99,
  category: "Standard"
}, {
  id: 6,
  name: "Enterprise Solution",
  description: "Complete package for large organizations with advanced security features.",
  imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Crect x='150' y='100' width='100' height='100' fill='%23F97316' fill-opacity='0.2' stroke='%23F97316' stroke-width='2'/%3E%3Cline x1='150' y1='130' x2='250' y2='130' stroke='%23F97316' stroke-width='2'/%3E%3Cline x1='150' y1='160' x2='250' y2='160' stroke='%23F97316' stroke-width='2'/%3E%3C/svg%3E",
  colorClass: "from-orange-500 to-amber-500",
  price: 299.99,
  category: "Premium"
}];

// Extract unique categories for filter
const categories = [...new Set(products.map(product => product.category))];
const ProductListing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => selectedCategories.includes(product.category));
    }

    // Price range filter
    if (priceRange) {
      result = result.filter(product => product.price >= priceRange.min && product.price <= priceRange.max);
    }

    // Sort
    switch (sortOrder) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // featured: keep original order
        break;
    }
    setFilteredProducts(result);
  }, [searchQuery, sortOrder, selectedCategories, priceRange]);
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via useEffect
    toast.info(`Searching for: ${searchQuery}`);
  };
  const clearFilters = () => {
    setSearchQuery("");
    setSortOrder("featured");
    setSelectedCategories([]);
    setPriceRange(null);
    toast.success("Filters cleared");
  };
  const addToCart = (product: Product) => {
    toast.success(`${product.name} added to cart!`);
  };
  return <div className="min-h-screen flex flex-col">
    <Navigation />

    <main className="flex-1 pt-24">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 my-[50px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold gradient-text">All Products</h1>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-8 w-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Button type="submit" size="sm" className="ml-2">
                Search
              </Button>
              <Button type="button" variant="outline" size="icon" className="ml-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {showFilters && <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-lg font-medium mb-3 block">Categories</Label>
                <div className="space-y-2">
                  {categories.map(category => <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={`category-${category}`} checked={selectedCategories.includes(category)} onCheckedChange={() => handleCategoryChange(category)} />
                    <label htmlFor={`category-${category}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {category}
                    </label>
                  </div>)}
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium mb-3 block">Price Range</Label>
                <Select onValueChange={value => {
                  switch (value) {
                    case "under-100":
                      setPriceRange({
                        min: 0,
                        max: 100
                      });
                      break;
                    case "100-200":
                      setPriceRange({
                        min: 100,
                        max: 200
                      });
                      break;
                    case "over-200":
                      setPriceRange({
                        min: 200,
                        max: 1000
                      });
                      break;
                    default:
                      setPriceRange(null);
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All prices</SelectItem>
                    <SelectItem value="under-100">Under $100</SelectItem>
                    <SelectItem value="100-200">$100 - $200</SelectItem>
                    <SelectItem value="over-200">Over $200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-lg font-medium mb-3 block">Sort By</Label>
                <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? filteredProducts.map(product => <div key={product.id} className="rounded-2xl overflow-hidden border border-border colorful-card h-full flex flex-col">
              <div className={`aspect-video overflow-hidden bg-gradient-to-r ${product.colorClass}`}>
                <img src={product.imageSrc} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 mix-blend-overlay" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-medium">{product.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mt-1">
                      {product.category}
                    </span>
                  </div>
                  <span className="font-medium text-primary">${product.price}</span>
                </div>
                <p className="text-muted-foreground flex-1">{product.description}</p>
                <div className="mt-6 flex gap-2">
                  <Link to={`/product/${product.id}`} className="text-primary font-medium hover-effect hover:opacity-80">
                    View details
                  </Link>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={() => addToCart(product)}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>) : <div className="col-span-full py-12 text-center">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>}
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>;
};
export default ProductListing;
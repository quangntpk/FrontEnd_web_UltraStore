
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductShowcase from "@/components/ProductShowcase";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  
  // Add smooth scroll effect for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would trigger filtering based on the search query
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <Features />
        
        {/* Search and Filtering Section */}
        <section className="py-12 px-6 bg-muted">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h2 className="text-2xl font-semibold gradient-text">Tìm kiếm sản phẩm</h2>
              
              <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Gõ tên sản phẩm cần tìm"
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" className="ml-2">
                  Tìm Kiếm
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            {showFilters && (
              <div className="bg-white p-4 rounded-md shadow-sm mb-8 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6">
                  <div>
                    <Label htmlFor="sort-by">Sắp xếp Theo</Label>
                    <Tabs defaultValue={sortOrder} className="w-[250px] mt-2" onValueChange={setSortOrder}>
                      <TabsList>
                        <TabsTrigger value="featured">Loại Sản Phẩm</TabsTrigger>
                        <TabsTrigger value="price-asc">Giá: Thấp tới Cao</TabsTrigger>
                        <TabsTrigger value="price-desc">Giá: Cao xuống thấp</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        <ProductShowcase />

      </main>
      <Footer />
    </div>
  );
};

export default Index;

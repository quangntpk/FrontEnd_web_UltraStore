import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

// Product type
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageSrc: string;
}

// Checkout form type
interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}
const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([{
    id: 1,
    name: "Premium Experience",
    price: 199.99,
    quantity: 1,
    imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ccircle cx='200' cy='150' r='80' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Cpath d='M160 150 Q 200 100, 240 150 T 320 150' stroke='%238B5CF6' fill='transparent' stroke-width='2'/%3E%3C/svg%3E"
  }, {
    id: 2,
    name: "Intuitive Design",
    price: 149.99,
    quantity: 2,
    imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpolygon points='200,80 240,150 200,220 160,150' fill='%238B5CF6' fill-opacity='0.2'/%3E%3Ccircle cx='200' cy='150' r='30' fill='%23f1f5f9' stroke='%238B5CF6' stroke-width='2'/%3E%3C/svg%3E"
  }]);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  });
  const handleQuantityChange = (id: number, change: number) => {
    setCartItems(prevItems => prevItems.map(item => item.id === id ? {
      ...item,
      quantity: Math.max(1, item.quantity + change)
    } : item));
  };
  const handleRemoveItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };
  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscountApplied(true);
      toast.success("Promo code applied successfully!");
    } else {
      toast.error("Invalid promo code");
    }
  };
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };
  const calculateDiscount = () => {
    return discountApplied ? calculateSubtotal() * 0.1 : 0;
  };
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };
  const handleCheckoutFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setCheckoutForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for empty required fields
    const requiredFields = ['fullName', 'email', 'address', 'city', 'zipCode', 'cardNumber', 'cardName', 'expiry', 'cvv'];
    const emptyFields = requiredFields.filter(field => !checkoutForm[field as keyof CheckoutForm]);
    if (emptyFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Here you would connect to your payment processor
    // For demo purposes, we'll just show a success message
    toast.success("Order placed successfully! Thank you for your purchase.");

    // Reset the cart
    setCartItems([]);
    setShowCheckout(false);
  };
  return <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-6xl my-[50px]">
          <h1 className="text-3xl font-bold mb-8 gradient-text">Your Shopping Cart</h1>
          
          {cartItems.length > 0 ? <>
              {!showCheckout ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {cartItems.map(item => <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 mb-4 bg-white rounded-lg shadow-sm border border-border">
                        <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                          <img src={item.imageSrc} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{item.name}</h3>
                          <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1 rounded-md hover:bg-muted">
                            <Minus size={16} />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1 rounded-md hover:bg-muted">
                            <Plus size={16} />
                          </button>
                          <button onClick={() => handleRemoveItem(item.id)} className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded-md">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>)}
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        
                        {discountApplied && <div className="flex justify-between text-green-600">
                            <span>Discount (10%)</span>
                            <span>-${calculateDiscount().toFixed(2)}</span>
                          </div>}
                        
                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-lg">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <Input placeholder="Promo Code (try SAVE10)" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="mr-2" />
                        <Button size="sm" onClick={handleApplyPromo}>Apply</Button>
                      </div>
                      
                      <Button className="w-full" onClick={() => setShowCheckout(true)}>
                        Proceed to Checkout
                      </Button>
                      <Link to="/" className="block text-center text-primary hover:underline mt-4">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSubmitCheckout} className="bg-white p-6 rounded-lg shadow-sm border border-border">
                      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" name="fullName" value={checkoutForm.fullName} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" value={checkoutForm.email} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" name="address" value={checkoutForm.address} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" name="city" value={checkoutForm.city} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input id="zipCode" name="zipCode" value={checkoutForm.zipCode} onChange={handleCheckoutFormChange} required />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" name="cardNumber" placeholder="XXXX XXXX XXXX XXXX" value={checkoutForm.cardNumber} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input id="cardName" name="cardName" value={checkoutForm.cardName} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" name="expiry" placeholder="MM/YY" value={checkoutForm.expiry} onChange={handleCheckoutFormChange} required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" name="cvv" placeholder="XXX" value={checkoutForm.cvv} onChange={handleCheckoutFormChange} required />
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button type="submit" className="flex-1 sm:order-2">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Complete Order
                        </Button>
                        <Button type="button" variant="outline" className="flex-1 sm:order-1" onClick={() => setShowCheckout(false)}>
                          Back to Cart
                        </Button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-4">
                      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                      
                      <div className="space-y-3 mb-6">
                        {cartItems.map(item => <div key={item.id} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {item.name} <span className="text-xs">x{item.quantity}</span>
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>)}
                        
                        <div className="border-t my-3"></div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        
                        {discountApplied && <div className="flex justify-between text-green-600">
                            <span>Discount (10%)</span>
                            <span>-${calculateDiscount().toFixed(2)}</span>
                          </div>}
                        
                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-lg">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
            </> : <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
              <Link to="/">
                <Button>Continue Shopping</Button>
              </Link>
            </div>}
        </div>
      </main>
      <Footer />
    </div>;
};
export default CartPage;
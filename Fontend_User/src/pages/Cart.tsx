// src/components/Cart.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import GiohangComboSupport from "@/components/GioHangComboSupport";

// Product type based on ctghSanPhamView with hinhAnh
interface CartItem {
  idSanPham: string;
  tenSanPham: string;
  mauSac: string;
  kickThuoc: string;
  soLuong: number;
  tienSanPham: number;
  hinhAnh: string;
}

// Combo type based on ctghComboView with hinhAnh and gia
interface ComboItem {
  idCombo: number;
  tenCombo: string;
  hinhAnh: string;
  soLuong: number;
  sanPhamList: {
    maSanPham: string;
    soLuong: number;
    version: number;
  }[];
  gia: number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  // Fetch cart data from API
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch("http://localhost:5261/api/Cart/GioHangByKhachHang?id=KH001");
        const data = await response.json();

        const processedCartItems = data.ctghSanPhamView.map((item: any) => ({
          ...item,
          hinhAnh: item.hinhAnh.startsWith("data:image")
            ? item.hinhAnh
            : `data:image/jpeg;base64,${item.hinhAnh}`,
        }));
        setCartItems(processedCartItems);

        const processedComboItems = data.ctghComboView.map((combo: any) => ({
          ...combo,
          hinhAnh: combo.hinhAnh.startsWith("data:image")
            ? combo.hinhAnh
            : `data:image/jpeg;base64,${combo.hinhAnh}`,
        }));
        console.log(processedComboItems);
        setComboItems(processedComboItems);
      } catch (error) {
        toast.error("Failed to load cart data");
        console.error("Error fetching cart:", error);
      }
    };
    fetchCartData();
  }, []);

  const handleQuantityChange = (idSanPham: string, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.idSanPham === idSanPham
          ? { ...item, soLuong: Math.max(1, item.soLuong + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (idSanPham: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.idSanPham !== idSanPham));
    toast.success("Item removed from cart");
  };

  const handleRemoveCombo = (idCombo: number) => {
    setComboItems((prevItems) => prevItems.filter((item) => item.idCombo !== idCombo));
    toast.success("Combo removed from cart");
  };

  const handleUpdateCombo = (updatedCombo: ComboItem) => {
    setComboItems((prevItems) =>
      prevItems.map((item) => (item.idCombo === updatedCombo.idCombo ? updatedCombo : item))
    );
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
    const productTotal = cartItems.reduce((sum, item) => sum + item.tienSanPham * item.soLuong, 0);
    const comboTotal = comboItems.reduce((sum, item) => sum + item.gia * item.soLuong, 0); // Use gia from API
    return productTotal + comboTotal;
  };

  const calculateDiscount = () => {
    return discountApplied ? calculateSubtotal() * 0.1 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleCheckoutFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "fullName",
      "email",
      "address",
      "city",
      "zipCode",
      "cardNumber",
      "cardName",
      "expiry",
      "cvv",
    ];
    const emptyFields = requiredFields.filter(
      (field) => !checkoutForm[field as keyof CheckoutForm]
    );
    if (emptyFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Order placed successfully! Thank you for your purchase.");
    setCartItems([]);
    setComboItems([]);
    setShowCheckout(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-6xl my-[50px]">
          <h1 className="text-3xl font-bold mb-8 gradient-text">Giỏ Hàng của bạn</h1>

          {(cartItems.length > 0 || comboItems.length > 0) ? (
            <>
              {!showCheckout ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {/* Products Section */}
                    {cartItems.map((item) => (
                      <div
                        key={item.idSanPham}
                        className="flex flex-col sm:flex-row items-start sm:items-center p-4 mb-4 bg-white rounded-lg shadow-sm border border-border"
                      >
                        <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                          <img
                            src={item.hinhAnh}
                            alt={item.tenSanPham}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{item.tenSanPham}</h3>
                          <p className="text-muted-foreground">
                            Size: {item.kickThuoc} | Color: {item.mauSac}
                          </p>
                          <p className="text-muted-foreground">
                            {(item.tienSanPham / 1000).toFixed(3)} VND
                          </p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <button
                            onClick={() => handleQuantityChange(item.idSanPham, -1)}
                            className="p-1 rounded-md hover:bg-muted"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.soLuong}</span>
                          <button
                            onClick={() => handleQuantityChange(item.idSanPham, 1)}
                            className="p-1 rounded-md hover:bg-muted"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.idSanPham)}
                            className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Combos Section */}
                    {comboItems.map((combo) => (
                      <div
                        key={combo.idCombo}
                        className="flex flex-col sm:flex-row items-start sm:items-center p-4 mb-4 bg-white rounded-lg shadow-sm border border-border"
                      >
                        <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                          <img
                            src={combo.hinhAnh}
                            alt={combo.tenCombo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{combo.tenCombo}</h3>
                          <p className="text-muted-foreground">
                            Gồm: {combo.sanPhamList.length} sản phẩm
                          </p>
                          <p className="text-muted-foreground">{(combo.gia / 1000).toFixed(3)} VND</p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <span className="mx-2 w-8 text-center">{combo.soLuong}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => setSelectedCombo(combo)}
                          >
                            Edit
                          </Button>
                          <button
                            onClick={() => handleRemoveCombo(combo.idCombo)}
                            className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{(calculateSubtotal() / 1000).toFixed(3)} VND</span>
                        </div>

                        {discountApplied && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount (10%)</span>
                            <span>-{(calculateDiscount() / 1000).toFixed(3)} VND</span>
                          </div>
                        )}

                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-lg">{(calculateTotal() / 1000).toFixed(3)} VND</span>
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <Input
                          placeholder="Promo Code (try SAVE10)"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="mr-2"
                        />
                        <Button size="sm" onClick={handleApplyPromo}>
                          Apply
                        </Button>
                      </div>

                      <Button className="w-full" onClick={() => setShowCheckout(true)}>
                        Proceed to Checkout
                      </Button>
                      <Link
                        to="/"
                        className="block text-center text-primary hover:underline mt-4"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <form
                      onSubmit={handleSubmitCheckout}
                      className="bg-white p-6 rounded-lg shadow-sm border border-border"
                    >
                      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={checkoutForm.fullName}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={checkoutForm.email}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={checkoutForm.address}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={checkoutForm.city}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={checkoutForm.zipCode}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>
                      </div>

                      <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={checkoutForm.cardNumber}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={checkoutForm.cardName}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            name="expiry"
                            placeholder="MM/YY"
                            value={checkoutForm.expiry}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="XXX"
                            value={checkoutForm.cvv}
                            onChange={handleCheckoutFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button type="submit" className="flex-1 sm:order-2">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Complete Order
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 sm:order-1"
                          onClick={() => setShowCheckout(false)}
                        >
                          Back to Cart
                        </Button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-4">
                      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                      <div className="space-y-3 mb-6">
                        {cartItems.map((item) => (
                          <div key={item.idSanPham} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {item.tenSanPham}{" "}
                              <span className="text-xs">x{item.soLuong}</span>
                            </span>
                            <span>
                              {((item.tienSanPham * item.soLuong) / 1000).toFixed(3)} VND
                            </span>
                          </div>
                        ))}
                        {comboItems.map((combo) => (
                          <div key={combo.idCombo} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {combo.tenCombo}{" "}
                              <span className="text-xs">x{combo.soLuong}</span>
                            </span>
                            <span>{((combo.gia * combo.soLuong) / 1000).toFixed(3)} VND</span>
                          </div>
                        ))}

                        <div className="border-t my-3"></div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{(calculateSubtotal() / 1000).toFixed(3)} VND</span>
                        </div>

                        {discountApplied && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount (10%)</span>
                            <span>-{(calculateDiscount() / 1000).toFixed(3)} VND</span>
                          </div>
                        )}

                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-lg">{(calculateTotal() / 1000).toFixed(3)} VND</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any products or combos to your cart yet.
              </p>
              <Link to="/">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Combo Edit Modal */}
      <Dialog.Root open={!!selectedCombo} onOpenChange={() => setSelectedCombo(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {selectedCombo && (
              <GiohangComboSupport
                combo={selectedCombo}
                onClose={() => setSelectedCombo(null)}
                onUpdateCombo={handleUpdateCombo}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default CartPage;
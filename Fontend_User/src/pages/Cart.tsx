import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import GiohangComboSupport from "@/components/GioHangComboSupport";
import Swal from "sweetalert2";

interface CartItem {
  idSanPham: string;
  tenSanPham: string;
  mauSac: string;
  kickThuoc: string;
  soLuong: number;
  tienSanPham: number;
  hinhAnh: string;
}

interface ComboItem {
  idCombo: number;
  tenCombo: string;
  hinhAnh: string;
  soLuong: number;
  chiTietGioHangCombo: number;
  sanPhamList: {
    hinhAnh: string;
    maSanPham: string;
    soLuong: number;
    version: number;
    tenSanPham: string;
  }[];
  gia: number;
}

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
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const fetchCartData = async () => {
      const userId = localStorage.getItem("userId");
      console.log(userId)
      if (!userId) {
        Swal.fire({
          title: "Vui lòng đăng nhập!",
          text: "Bạn cần đăng nhập để xem giỏ hàng.",
          icon: "warning",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate("/login");
        });
        return;
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`http://localhost:5261/api/Cart/CopyGioHang?id=${userId}`)}&size=200x200`;
      setQrCodeUrl(qrUrl);

      try {
        const response = await fetch(`http://localhost:5261/api/Cart/GioHangByKhachHang?id=${userId}`);
        const data = await response.json();
        console.log(data)
        const processedCartItems = data.ctghSanPhamView.map((item: any) => ({
          ...item,
          hinhAnh: item.hinhAnh.startsWith("data:image")
            ? item.hinhAnh
            : `data:image/jpeg;base64,${item.hinhAnh}`,
        }));
        setCartItems(processedCartItems);

        const processedComboItems = data.ctghComboView.map((combo: any) => ({
          ...combo,
          chiTietGioHangCombo: combo.chiTietGioHangCombo,
          hinhAnh: combo.hinhAnh?.startsWith("data:image")
            ? combo.hinhAnh
            : combo.hinhAnh
            ? `data:image/jpeg;base64,${combo.hinhAnh}`
            : "/placeholder-image.jpg",
          sanPhamList: combo.sanPhamList.map((item: any) => ({
            ...item,
            hinhAnh: item.hinhAnh?.startsWith("data:image")
              ? item.hinhAnh
              : item.hinhAnh
              ? `data:image/jpeg;base64,${item.hinhAnh}`
              : "/placeholder-image.jpg",
          })),
        }));
        setComboItems(processedComboItems);
      } catch (error) {
        toast.error("Failed to load cart data");
        console.error("Error fetching cart:", error);
      }
    };
    fetchCartData();
  }, [navigate]);

  const handleQuantityChange = async (idSanPham: string, change: number) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thay đổi số lượng.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const info = {
      MaKhachHang: userId,
      IDSanPham: idSanPham,
      IDCombo: null,
    };

    try {
      if (change > 0) {
        await fetch("http://localhost:5261/api/Cart/TangSoLuongSanPham", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });
      } else {
        await fetch("http://localhost:5261/api/Cart/GiamSoLuongSanPham", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.idSanPham === idSanPham
            ? { ...item, soLuong: Math.max(1, item.soLuong + change) }
            : item
        )
      );
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (idSanPham: string) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để xóa sản phẩm.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bạn có chắc không?",
      text: "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa nó!",
      cancelButtonText: "Không, giữ lại",
    });

    if (result.isConfirmed) {
      const info = {
        MaKhachHang: userId,
        IDSanPham: idSanPham,
        IDCombo: null,
      };
      try {
        await fetch("http://localhost:5261/api/Cart/XoaSanPham", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });

        setCartItems((prevItems) => prevItems.filter((item) => item.idSanPham !== idSanPham));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (error) {
        toast.error("Xóa sản phẩm thất bại");
        console.error("Error removing item:", error);
      }
    }
  };

  const handleRemoveCombo = async (idCombo: number) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để xóa combo.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const result = await Swal.fire({
      title: "Bạn có chắc không?",
      text: "Bạn có muốn xóa combo này khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa nó!",
      cancelButtonText: "Không, giữ lại",
    });

    if (result.isConfirmed) {
      const info = {
        MaKhachHang: userId,
        IDSanPham: null,
        IDCombo: idCombo,
      };

      try {
        await fetch("http://localhost:5261/api/Cart/XoaCombo", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        });

        setComboItems((prevItems) => prevItems.filter((item) => item.idCombo !== idCombo));
        toast.success("Đã xóa combo khỏi giỏ hàng");
      } catch (error) {
        toast.error("Xóa combo thất bại");
        console.error("Error removing combo:", error);
      }
    }
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
    const comboTotal = comboItems.reduce((sum, item) => sum + item.gia * item.soLuong, 0);
    return productTotal + comboTotal;
  };

  const calculateDiscount = () => {
    return discountApplied ? calculateSubtotal() * 0.1 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

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

  const handleCheckoutFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Vui lòng đăng nhập!",
        text: "Bạn cần đăng nhập để thanh toán.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate("/login");
      });
      return;
    }

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
                            {formatCurrency(item.tienSanPham)} VND
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
                          <p className="text-muted-foreground">{formatCurrency(combo.gia)} VND</p>
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
                      <h2 className="text-xl font-semibold mb-4">Giỏ Hàng</h2>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tổng Tiền</span>
                          <span>{formatCurrency(calculateSubtotal())} VND</span>
                        </div>

                        {discountApplied && (
                          <div className="flex justify-between text-green-600">
                            <span>Giảm Giá (10%)</span>
                            <span>-{formatCurrency(calculateDiscount())} VND</span>
                          </div>
                        )}

                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Thành Tiền</span>
                          <span className="text-lg">{formatCurrency(calculateTotal())} VND</span>
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
                          Áp Dụng
                        </Button>
                      </div>

                      <Button className="w-full" onClick={() => setShowCheckout(true)}>
                        Chuyển đến trang Thanh Toán
                      </Button>
                      <Link
                        to="/"
                        className="block text-center text-primary hover:underline mt-4"
                      >
                        Quay về trang Sản Phẩm
                      </Link>

                      {/* QR Code Section */}
                      {qrCodeUrl && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2 text-center">
                            Chia sẻ mã QR này để cho bạn bè Copy giỏ hàng của bạn
                          </h3>
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      )}
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
                            <span>{formatCurrency(item.tienSanPham)} VND</span>
                          </div>
                        ))}
                        {comboItems.map((combo) => (
                          <div key={combo.idCombo} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {combo.tenCombo}{" "}
                              <span className="text-xs">x{combo.soLuong}</span>
                            </span>
                            <span>{formatCurrency(combo.gia * combo.soLuong)} VND</span>
                          </div>
                        ))}

                        <div className="border-t my-3"></div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(calculateSubtotal())} VND</span>
                        </div>

                        {discountApplied && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount (10%)</span>
                            <span>-{formatCurrency(calculateDiscount())} VND</span>
                          </div>
                        )}

                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-lg">{formatCurrency(calculateTotal())} VND</span>
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

      <Dialog.Root open={!!selectedCombo} onOpenChange={(open) => !open && setSelectedCombo(null)}>
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
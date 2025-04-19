import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const orderId = query.get("orderId");
    const transactionId = query.get("transactionId");
    const message = query.get("message");

    if (status === "success" && orderId) {
      toast.success("Thanh toán VnPay thành công!", {
        description: `Mã đơn hàng: ${orderId}${transactionId ? `, Mã giao dịch: ${transactionId}` : ""}`,
        duration: 5000,
        action: {
          label: "Xem chi tiết",
          onClick: () => navigate("/order-history", { state: { orderId } }),
        },
      });
      navigate("/", { state: { orderId } });
    } else {    
      navigate("/order-history");
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang xử lý...</p>
    </div>
  );
};

export default PaymentSuccess;
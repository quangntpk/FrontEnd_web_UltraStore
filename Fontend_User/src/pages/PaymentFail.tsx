// PaymentFail.tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentFail = () => {
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const status = query.get("status");
        const message = query.get("message") || "Thanh toán không thành công. Vui lòng thử lại.";

        if (status === "failed") {
            toast.error("Thanh toán thất bại", {
                description: message,
                duration: 5000,
            });
        }
    }, [location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
                <p className="text-gray-600 mb-6">
                    {new URLSearchParams(location.search).get("message") || "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại."}
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/">
                        <Button variant="outline">Quay về trang chủ</Button>
                    </Link>
                    <Link to="/cart">
                        <Button>Quay về giỏ hàng</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFail;
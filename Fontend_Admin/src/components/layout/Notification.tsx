import React, { useEffect } from "react";

interface NotificationProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  duration?: number; // thời gian (ms) để tự động ẩn thông báo
  inHeader?: boolean; // Nếu true, hiển thị theo vị trí trong Header
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = "info",
  onClose,
  duration,
  inHeader = false,
}) => {
  // Tự động đóng thông báo sau thời gian duration (nếu được cung cấp)
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount
    }
  }, [duration, onClose]);

  // Định nghĩa kiểu dáng cho các loại thông báo
  const typeStyles = {
    info: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    success: "bg-blue-100 text-blue-800 border-blue-400",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
  };

  return (
    <div
      className={`${
        inHeader ? "absolute top-2 right-2" : "fixed top-20 right-4"
      } max-w-sm w-full p-4 rounded-md border-l-4 shadow-md ${typeStyles[type]}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;

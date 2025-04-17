// src/hooks/useAuth.ts
import { useState } from "react";

interface User {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  vaiTro: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Đọc dữ liệu từ localStorage khi khởi tạo
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAdmin = user?.vaiTro === 1;
  const isEmployee = user?.vaiTro === 2;
  const isUser = user?.vaiTro === 0;

  return { user, isAdmin, isEmployee, isUser, setUser };
};
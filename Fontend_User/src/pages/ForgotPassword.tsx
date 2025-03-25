import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import styles from '@/css/ForgotPassword.module.css';


const emailSchema = z.object({
  email: z.string().email('Email không hợp lệ').nonempty('Email không được để trống'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có đúng 6 ký tự').nonempty('Mã OTP không được để trống'),
});

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
      // .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 ký tự in hoa')
      // .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
      // .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
    confirmPassword: z.string().nonempty('Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<number>(1); // Quản lý bước: 1 (nhập email), 2 (nhập OTP), 3 (đặt lại mật khẩu)
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5261/api/XacThuc'; 



  // Interface cho request body
  interface ForgotPasswordRequest {
    email: string;
    otp?: string;
    newPassword?: string;
  }

  interface ApiResponse {
    message: string;
  }

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });


  // Bước 1: Gửi yêu cầu gửi OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post<ApiResponse>(`${API_BASE_URL}/forgot-password`, { email });
      toast.success(response.data.message || 'Mã OTP đã được gửi đến email của bạn!');
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post<ApiResponse>(`${API_BASE_URL}/verify-otp`, { email, otp });
      toast.success(response.data.message || 'Mã OTP hợp lệ!');
      setStep(3); // Chuyển sang bước đặt lại mật khẩu
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<ApiResponse>(`${API_BASE_URL}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success(response.data.message || 'Đặt lại mật khẩu thành công!');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordWrapper}>
          <Navigation />
      <div className={styles.forgotPasswordCard}>
        <div className={styles.cardHeader}>
          <div className={styles.logoPlaceholder}>U</div> {/* Placeholder logo */}
          <h2 className={styles.cardTitle}>Quên mật khẩu</h2>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={styles.formControl}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email của bạn"
              />
              {emailForm.formState.errors.email && (
                <p style={{ color: 'red', fontSize: '14px' }}>
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mã OTP</label>
              <input
                type="text"
                className={styles.formControl}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Nhập mã OTP bạn nhận được"
              />
              {otpForm.formState.errors.otp && (
                <p style={{ color: 'red', fontSize: '14px' }}>
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Đang xác minh...' : 'Xác minh OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mật khẩu mới</label>
              <input
                type="password"
                className={styles.formControl}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu mới"
              />
              {resetPasswordForm.formState.errors.newPassword && (
                <p style={{ color: 'red', fontSize: '14px' }}>
                  {resetPasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Xác nhận mật khẩu</label>
              <input
                type="password"
                className={styles.formControl}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Xác nhận mật khẩu mới"
              />
              {resetPasswordForm.formState.errors.confirmPassword && (
                <p style={{ color: 'red', fontSize: '14px' }}>
                  {resetPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}
      </div>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ForgotPassword;
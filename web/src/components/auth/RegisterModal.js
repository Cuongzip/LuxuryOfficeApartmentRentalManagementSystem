'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { registerSchema, validateForm } from '@/validators';
import toast from 'react-hot-toast';

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, countdown]);

  const handleResendEmail = () => {
    setCountdown(60);
    toast.success('Đã gửi lại email xác thực thành công! Vui lòng kiểm tra hộp thư.');
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setFieldErrors({});

    const validation = validateForm(registerSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nationalId: formData.nationalId,
      });

      toast.success('Đăng ký thành công!');
      setSuccess(formData.email);
      setCountdown(60);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        nationalId: '',
        password: '',
        confirmPassword: '',
      });
      setFieldErrors({});
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        toast.error(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={success ? "Xác thực Email" : "Đăng ký tài khoản"} size="md">
      {!success ? (
        <>
          <div className="flex flex-col items-center mb-4">
            <img src="/images/logo.png" alt="Logo" className="w-60  object-contain mb-2" />

          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <Input
              label="Họ và tên"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              error={fieldErrors.fullName}
            />

            <Input
              label="Địa chỉ Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nguyenvana@gmail.com"
              required
              error={fieldErrors.email}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Số điện thoại"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                required
                error={fieldErrors.phone}
              />

              <Input
                label="Số CCCD"
                id="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="012345678912"
                required
                error={fieldErrors.nationalId}
              />
            </div>

            <Input
              label="Mật khẩu"
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              required
              error={fieldErrors.password}
            />

            <Input
              label="Nhập lại mật khẩu"
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Trùng khớp mật khẩu trên"
              required
              error={fieldErrors.confirmPassword}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Đăng ký tài khoản
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
            Đã có tài khoản?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-neutral-900 hover:underline font-semibold cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center py-4 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-neutral-900">Xác thực tài khoản của bạn</h3>
            <p className="text-sm text-neutral-600 max-w-sm">
              Chúng tôi đã gửi một email xác thực đến địa chỉ:
              <br />
              <span className="font-semibold text-neutral-950 break-all">{success}</span>
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 text-xs text-neutral-500 text-left space-y-2 max-w-sm w-full">
            <p className="font-semibold text-neutral-700">Các bước tiếp theo:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Mở hòm thư cá nhân của bạn.</li>
              <li>Kiểm tra cả thư mục <strong>Spam (Thư rác)</strong> nếu không thấy ở hộp thư đến.</li>
              <li>Nhấp vào liên kết xác thực trong email để kích hoạt tài khoản.</li>
            </ol>
          </div>

          <div className="w-full pt-2">
            <Button variant="primary" onClick={onSwitchToLogin} className="w-full">
              Đăng nhập ngay
            </Button>
          </div>

          <div className="text-xs text-neutral-500">
            {countdown > 0 ? (
              <p>Bạn có thể gửi lại email xác thực sau <span className="font-semibold text-neutral-900">{countdown}s</span></p>
            ) : (
              <p>
                Chưa nhận được email?{' '}
                <button
                  onClick={handleResendEmail}
                  className="text-neutral-900 hover:underline font-semibold cursor-pointer"
                >
                  Gửi lại email xác thực
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

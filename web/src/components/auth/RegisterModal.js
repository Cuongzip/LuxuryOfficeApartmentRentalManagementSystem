'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        nationalId: formData.nationalId,
      });

      if (res.success) {
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          nationalId: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        setError(res.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng ký tài khoản" size="md">
      <div className="flex flex-col items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-lg mb-2">
          L
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          Đăng ký tài khoản khách thuê căn hộ & văn phòng dịch vụ
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium">
          {success}
        </div>
      )}

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Họ và tên"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
          />

          <Input
            label="Địa chỉ Email"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nguyenvana@gmail.com"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Số điện thoại"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912345678"
              required
            />

            <Input
              label="Số CCCD"
              id="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="012345678912"
              required
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
          />

          <Input
            label="Nhập lại mật khẩu"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Trùng khớp mật khẩu trên"
            required
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
      ) : (
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={onSwitchToLogin} className="w-full">
            Đăng nhập ngay
          </Button>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-900 pt-4">
        Đã có tài khoản?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-zinc-900 dark:text-zinc-100 hover:underline font-semibold cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    </Modal>
  );
};

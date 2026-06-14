'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { registerSchema, validateForm } from '@/validators';

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    const validation = validateForm(registerSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
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
        setFieldErrors({});
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
        <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain mb-2" />
        <p className="text-xs text-neutral-500 text-center">
          Đăng ký tài khoản khách thuê căn hộ & văn phòng dịch vụ
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium">
          {success}
        </div>
      )}

      {!success ? (
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
      ) : (
        <div className="mt-4 flex justify-center">
          <Button variant="primary" onClick={onSwitchToLogin} className="w-full">
            Đăng nhập ngay
          </Button>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
        Đã có tài khoản?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-neutral-900 hover:underline font-semibold cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    </Modal>
  );
};

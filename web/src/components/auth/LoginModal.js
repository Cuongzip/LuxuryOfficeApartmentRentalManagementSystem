'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ROLES } from '@/constants';
import { loginSchema, validateForm } from '@/validators';

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const validation = validateForm(loginSchema, { email, password });
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);
      onClose();

      if (data.account.role === ROLES.ADMIN || data.account.role === ROLES.EMPLOYEE) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng nhập hệ thống" size="md">
      <div className="flex flex-col items-center mb-6">
        <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain mb-2" />
        <p className="text-xs text-neutral-500 text-center">
          Quản lý căn hộ & văn phòng dịch vụ cao cấp
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Địa chỉ Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@luxuryrental.vn"
          required
          error={fieldErrors.email}
        />

        <Input
          label="Mật khẩu"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          error={fieldErrors.password}
        />

        <div className="flex justify-between items-center text-xs pt-1">
          <label className="flex items-center gap-1.5 text-neutral-500 cursor-pointer select-none">
            <input type="checkbox" className="rounded border-neutral-200 text-neutral-900 focus:ring-0 focus:ring-offset-0" />
            Ghi nhớ đăng nhập
          </label>
          <a href="#" className="text-neutral-600 hover:text-neutral-900 font-medium">
            Quên mật khẩu?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full mt-2"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
        Chưa có tài khoản khách thuê?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-neutral-900 hover:underline font-semibold cursor-pointer"
        >
          Đăng ký ngay
        </button>
      </div>
    </Modal>
  );
};

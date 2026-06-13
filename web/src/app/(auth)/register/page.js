'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
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
    <Card className="!border-zinc-800 bg-zinc-900 text-zinc-100 p-8 shadow-2xl">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xl mb-3">
          L
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Tạo tài khoản mới</h2>
        <p className="text-sm text-zinc-400 mt-1 text-center">
          Đăng ký tài khoản khách thuê căn hộ & văn phòng dịch vụ
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-950/50 border border-red-800/50 rounded-lg text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-sm text-emerald-400 font-medium">
          {success}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
            className="text-white"
            inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
          />

          <Input
            label="Địa chỉ Email"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nguyenvana@gmail.com"
            required
            className="text-white"
            inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912345678"
              required
              className="text-white"
              inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
            />

            <Input
              label="Số CCCD"
              id="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="012345678912"
              required
              className="text-white"
              inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
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
            className="text-white"
            inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
          />

          <Input
            label="Nhập lại mật khẩu"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Trùng khớp mật khẩu trên"
            required
            className="text-white"
            inputClassName="bg-zinc-950/50 border-zinc-800 focus:ring-zinc-700 focus:border-transparent text-white"
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-4 !bg-white !text-zinc-950 hover:!bg-zinc-200"
          >
            Đăng ký tài khoản
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-zinc-400 border-t border-zinc-800 pt-5">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-white hover:underline font-semibold">
          Đăng nhập ngay
        </Link>
      </div>
    </Card>
  );
}

'use client';

import { redirect } from 'next/navigation';

export default function CustomerDashboardRedirect() {
  redirect('/customer/contracts');
  return null;
}

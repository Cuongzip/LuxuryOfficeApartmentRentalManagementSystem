'use client';

import { redirect } from 'next/navigation';

export default function ManagerDashboard() {
  redirect('/manager/contracts');
  return null;
}

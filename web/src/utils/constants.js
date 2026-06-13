/**
 * App Constants and Mappings
 */

export const ROLES = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee',
  CUSTOMER: 'Customer',
};

// Vietnames Translation & Style mapping for Room Status
export const ROOM_STATUS = {
  AVAILABLE: {
    value: 'Trống',
    label: 'Còn trống',
    colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  RENTED: {
    value: 'Đã thuê',
    label: 'Đã thuê',
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  MAINTENANCE: {
    value: 'Bảo trì',
    label: 'Đang bảo trì',
    colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
};

// Get status object by DB string value
export const getRoomStatus = (statusStr) => {
  if (!statusStr) return { value: '', label: 'Chưa rõ', colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200' };
  const lower = statusStr.toLowerCase();
  if (lower.includes('trống') || lower.includes('avail') || lower.includes('trong')) {
    return ROOM_STATUS.AVAILABLE;
  }
  if (lower.includes('thuê') || lower.includes('rent') || lower.includes('thue')) {
    return ROOM_STATUS.RENTED;
  }
  if (lower.includes('trì') || lower.includes('maint') || lower.includes('tri')) {
    return ROOM_STATUS.MAINTENANCE;
  }
  return {
    value: statusStr,
    label: statusStr,
    colorClass: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
  };
};

export const CONTRACT_STATUS = {
  ACTIVE: {
    value: 'Đang hoạt động',
    colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  EXPIRED: {
    value: 'Hết hạn',
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  PENDING: {
    value: 'Chờ duyệt',
    colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
};

export const getContractStatus = (statusStr) => {
  if (!statusStr) return { value: '', colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200' };
  const lower = statusStr.toLowerCase();
  if (lower.includes('hoạt động') || lower.includes('active') || lower.includes('hoat dong')) {
    return CONTRACT_STATUS.ACTIVE;
  }
  if (lower.includes('hết hạn') || lower.includes('expired') || lower.includes('het han')) {
    return CONTRACT_STATUS.EXPIRED;
  }
  if (lower.includes('chờ') || lower.includes('pending') || lower.includes('cho')) {
    return CONTRACT_STATUS.PENDING;
  }
  return {
    value: statusStr,
    colorClass: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
  };
};

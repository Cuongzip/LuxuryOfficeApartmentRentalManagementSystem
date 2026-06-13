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

export const CONTRACT_STATUS = {
  ACTIVE: {
    value: 'Đang hoạt động',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  EXPIRED: {
    value: 'Hết hạn',
    colorClass: 'bg-red-100 text-red-800 border-red-200',
  },
  PENDING: {
    value: 'Chờ duyệt',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-200',
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
    colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  };
};

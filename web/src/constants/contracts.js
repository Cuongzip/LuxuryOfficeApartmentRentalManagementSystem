export const CONTRACT_STATUS = {
  ACTIVE: {
    value: 'Đang hiệu lực',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  EXPIRED: {
    value: 'Đã hết hạn',
    colorClass: 'bg-red-100 text-red-800 border-red-200',
  },
  CANCELLED: {
    value: 'Đã hủy',
    colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  },
};

export const getContractStatus = (statusStr) => {
  if (!statusStr) return { value: '', colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200' };
  const lower = statusStr.toLowerCase();
  if (lower.includes('hiệu lực') || lower.includes('hoạt động') || lower.includes('active') || lower.includes('hieu luc')) {
    return CONTRACT_STATUS.ACTIVE;
  }
  if (lower.includes('hết hạn') || lower.includes('expired') || lower.includes('het han')) {
    return CONTRACT_STATUS.EXPIRED;
  }
  if (lower.includes('hủy') || lower.includes('cancelled') || lower.includes('huy')) {
    return CONTRACT_STATUS.CANCELLED;
  }
  return {
    value: statusStr,
    colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  };
};

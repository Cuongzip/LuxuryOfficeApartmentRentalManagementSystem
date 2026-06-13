export const ROOM_STATUS = {
  AVAILABLE: {
    value: 'Trống',
    label: 'Còn trống',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  RENTED: {
    value: 'Đã thuê',
    label: 'Đã thuê',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  MAINTENANCE: {
    value: 'Bảo trì',
    label: 'Đang bảo trì',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
};

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
    colorClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  };
};

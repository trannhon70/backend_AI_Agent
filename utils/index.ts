//thời gian hết hạn redis
export const expirationTime = 12 * 60 * 60 * 1000; // 8 giờ (milliseconds)
export const expiresIn = '12h'

// export const expirationTime = 30 * 1000; // 30 giây (milliseconds)
// export const expiresIn = '30s'; // 30 giây


export const CheckRoles = {
  ADMIN: 1,
  QUANLY: 2,
  TUVAN: 3,
}

export const searchTimestampOneDay = () => {
  const TZ_OFFSET_MS = 7 * 60 * 60 * 1000; // GMT+7
  const now = new Date();

  // "Giả lập" now ở GMT+7
  const nowInVN = new Date(now.getTime() + TZ_OFFSET_MS);

  // Lấy 00:00:00 và 23:59:59 của NGÀY VN
  const startVN = new Date(nowInVN.getFullYear(), nowInVN.getMonth(), nowInVN.getDate(), 0, 0, 0, 0);
  const endVN = new Date(nowInVN.getFullYear(), nowInVN.getMonth(), nowInVN.getDate(), 23, 59, 59, 999);

  return {
    startTimestamp: Math.floor((startVN.getTime() - TZ_OFFSET_MS) / 1000),
    endTimestamp: Math.floor((endVN.getTime() - TZ_OFFSET_MS) / 1000),
  };
};
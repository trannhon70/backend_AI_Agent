//thời gian hết hạn redis
export const expirationTime = 12 * 60 * 60 * 1000; // 8 giờ (milliseconds)
export const expiresIn = '12h'

// export const expirationTime = 30 * 1000; // 30 giây (milliseconds)
// export const expiresIn = '30s'; // 30 giây


export const CheckObjectFacebook = {
    PAGE: "page",
} as const;


//convert 2026-06-22T07:10:44+0000 to 1782469683
export const toUnixTimestamp = (isoString: string): number => {
    return Math.floor(new Date(isoString).getTime() / 1000);
};
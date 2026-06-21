
//owner: Chủ hệ thống | ADMIN_MANAGE: Quản trị viên | SALE: Nhân viên kinh doanh | CSKH: Nhân viên chăm sóc khách hàng
export enum RoleEnum {
    OWNER = 1,
    ADMIN_MANAGE = 2,
    SALE = 3,
    CSKH = 4,
}

export enum ProviderEnum {
    LOCAL = 'local',
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    GITHUB = 'github',
    APPLE = 'apple',
}

export enum MessageDirection {
    INBOUND = 'inbound',   // khách gửi vào
    OUTBOUND = 'outbound', // agent/bot gửi ra
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    FILE = 'file',
    STICKER = 'sticker',
}

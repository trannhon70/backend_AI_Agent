import { Metadata } from "@grpc/grpc-js";
import { NormalizedAttachment } from "../interfaces";

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

export const normalizeAttachments = (attachments: any[], source: 'webhook' | 'sync'): NormalizedAttachment[] => {
    if (!attachments?.length) return [];

    if (source === 'sync') {
        // attachments từ Graph API: item.attachments?.data
        return attachments.map((att) => ({
            id: att.id ?? null,
            mime_type: att.mime_type ?? null,
            name: att.name ?? null,
            url: att.image_data?.url ?? null,
            preview_url: att.image_data?.preview_url ?? null,
            width: att.image_data?.width ?? null,
            height: att.image_data?.height ?? null,
            image_type: att.image_data?.image_type ?? null,
            render_as_sticker: att.image_data?.render_as_sticker ?? false,
        }));
    }

    if (source === 'webhook') {
        // attachments từ webhook: event.message.attachments
        return attachments.map((att) => ({
            id: null,
            mime_type: resolveMimeType(att.type),
            name: att.type ?? null,
            url: att.payload?.url ?? null,
            preview_url: att.payload?.url ?? null,
            width: null,
            height: null,
            image_type: null,
            render_as_sticker: att.payload?.sticker_id ? true : false,
        }));
    }

    return [];
};

// Map type webhook -> mime_type
const resolveMimeType = (type: string): string | null => {
    const map: Record<string, string> = {
        image: 'image/jpeg',
        video: 'video/mp4',
        audio: 'audio/mpeg',
        file: 'application/octet-stream',
        gif: 'image/gif',
    };
    return map[type] ?? null;
};


export function getCurrentUser(metadata: Metadata): any {
    return (metadata as Metadata & { user: any }).user;
}
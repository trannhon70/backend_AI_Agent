import { diskStorage } from 'multer';

export const fileUploadInterceptor = (destination: string) => {
    return {
        storage: diskStorage({
            destination,
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fileExt = file.originalname.split('.').pop();
                const filename = `${file.fieldname}-${uniqueSuffix}.${fileExt}`;
                callback(null, filename);
            },
        }),
    };
};

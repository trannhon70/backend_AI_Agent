import { NextFunction, Response } from 'express';

export function RoleMiddleware(roles: number[]) {
    return (req: any, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role.id)) {
            return res.status(403).json({ message: 'Không có quyền!' });
        }
        next();
    };
}
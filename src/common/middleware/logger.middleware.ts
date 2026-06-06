import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);

    // Gọi next() để chuyển đến controller
    next();

    // Sau khi controller xử lý xong, tính thời gian xử lý
    const endTime = Date.now();
    console.log(`Request completed in ${endTime - startTime}ms`);
  }
}
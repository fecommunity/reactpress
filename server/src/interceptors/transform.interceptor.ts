import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { responseLogger } from '../logger';

interface ApiResponse<T> {
  statusCode: number;
  msg: null;
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const url = String(request?.originalUrl || request?.url || '');
    if (/\/health\/?(\?|$)/i.test(url)) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const req = ctx.getRequest();

        const statusCode = response.statusCode;
        const path = req.originalUrl;
        const res: ApiResponse<unknown> = {
          statusCode,
          msg: null,
          success: true,
          data,
        };
        responseLogger.info(path, res);
        return res;
      })
    );
  }
}

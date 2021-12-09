import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    const method = request.method;
    const url = request.originalUrl;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        console.log(`${response.statusCode} | [${method}] ${url} - ${delay}ms`);
      }),
      catchError((error) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        console.error(
          `${response.statusCode} | [${method}] ${url} - ${delay}ms`,
        );
        return throwError(error);
      }),
    );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as client from 'prom-client';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private histogram: client.Histogram;

  constructor() {
    this.histogram = new client.Histogram({
      name: 'response_time',
      help: 'Response time of APIs',
      buckets: client.exponentialBuckets(1, 1.5, 30),
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // You can log or store the response time as needed
        console.log(`Response time: ${responseTime}ms`);
        this.histogram.observe(responseTime);
        // You can also add a custom header to the response if needed
        // response.header('X-Response-Time', `${responseTime}ms`);
      }),
    );
  }
}

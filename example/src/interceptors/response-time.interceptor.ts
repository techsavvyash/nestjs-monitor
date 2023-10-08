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

  constructor(histogramTitle: string) {
    this.histogram = new client.Histogram({
      name: histogramTitle,
      help: 'Response time of APIs',
      buckets: client.exponentialBuckets(1, 1.5, 30),
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(`Response time: ${responseTime}ms`);
        this.histogram.observe(responseTime);
      }),
    );
  }
}

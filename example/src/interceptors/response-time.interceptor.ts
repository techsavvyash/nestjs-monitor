import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as client from 'prom-client';

import * as fs from 'fs';
import { panelConfig } from './fixture';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private histogram: client.Histogram;

  constructor(
    histogramTitle: string,
    jsonPath = '../monitor/grafana/provisioning/dashboards/response_times.json',
  ) {
    const name = histogramTitle + '_response_time';
    this.histogram = new client.Histogram({
      name: name,
      help: 'Response time of APIs',
      buckets: client.exponentialBuckets(1, 1.5, 30),
      labelNames: ['statusCode', 'endpoint'], // What names to add here??
    });

    // reading the file
    try {
      const content = fs.readFileSync(jsonPath, 'utf8');
      const parsedContent = JSON.parse(content);
      parsedContent.panels.push(panelConfig(name));

      // write back to file
      // fs.writeFileSync(jsonPath, JSON.stringify(parsedContent));

      console.log('Successfully added histogram to dashboard!');
    } catch (err) {
      console.error('Error reading provisioning json from disk!', err);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    console.log('response: ', response);

    const startTime = performance.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const statusCode = response.statusCode;
        const endpoint = request.url;

        this.histogram.labels({ statusCode, endpoint }).observe(responseTime);
      }),
    );
  }
}

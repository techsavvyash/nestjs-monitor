import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';

@Controller()
@UseInterceptors(new ResponseTimeInterceptor('class_response_time'))
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get()
  getHello(): string {
    this.monitoringService.incrementRequestCounter();
    return this.appService.getHello();
  }

  @Get('/route')
  async randomRoute(@Query('delay') delay: number): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return 'Hello from random route!';
  }
}

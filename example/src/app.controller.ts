import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get()
  @UseInterceptors(ResponseTimeInterceptor)
  getHello(): string {
    this.monitoringService.incrementRequestCounter();
    return this.appService.getHello();
  }
}

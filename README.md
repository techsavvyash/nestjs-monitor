<h1 align="center">NestJS Monitor</h1>

<div align="center">
An opinionated nestjs monitoring setup with Prometheus and Grafana.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ChakshuGautam/nestjs-monitor)

## How to use the `response-time` interceptor 

### At a method/endpoint level

```ts
@Get()
  @UseInterceptors(new ResponseTimeInterceptor('monitoring_response_time')) // <<-- focus on this line
  getMonitoringHell(): string {
    return 'Hello from monitoring controller!';
  }
```

### At a class/controller level

```ts
@Controller()
@UseInterceptors(new ResponseTimeInterceptor('class_response_time'))// <<-- focus on this line
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
```

### At global level

```ts
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalInterceptors(new ResponseTimeInterceptor('global_interceptor')); //<<-- focus on this line
}
```
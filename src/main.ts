import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'winston-daily-rotate-file';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as cors from 'cors';
import { urlencoded, json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/filters/httpexception.filter';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './core/filters/allExceptions.filter';
import { ResponseTransformInterceptor } from './core/interceptors/response.transform.interceptor';
import { GlobalErrorInterceptor } from './core/interceptors/globalError.interceptor';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize({ all: true }),
            nestWinstonModuleUtilities.format.nestLike('IEBAApp', {
              // options
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('IEBAApp', {
              // options
            }),
          ),
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('IEBAApp', {
              // options
            }),
          ),
          filename: 'logs/application-error-%DATE%.log',
          level: 'error',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '14d',
        }),
      ],
      // other options
    }),
  });

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 5500,
    },
  });

  // API Document generation
  const document = new DocumentBuilder()
    .setTitle('ats')
    .setDescription('ats API descriptions')
    .setVersion('1.0')
    .addBearerAuth(
    {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const writerDescriptorDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('', app, writerDescriptorDocument);

  app.setGlobalPrefix('api/v1');
  app.use(cors({
    origin: ["http://localhost:5174","http://localhost:5173", '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  app.use(cookieParser());
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new GlobalErrorInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter(httpAdapterHost));
  app.use(json({ limit: '30mb' }));
  app.use(urlencoded({ extended: true, limit: '30mb' }));
  await app.startAllMicroservices();
  await app.listen(process.env.APP_PORT || 8080);
}
bootstrap();

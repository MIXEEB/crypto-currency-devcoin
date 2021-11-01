import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const pIndex = process.argv.findIndex((arg) => arg === "-p");
  const port = pIndex !== -1 ? parseInt(process.argv[pIndex + 1]) : 3000;
  
  console.log
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}
bootstrap();
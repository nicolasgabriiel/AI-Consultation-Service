import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MeasurementService } from './services/MeasurementService';
import { Measurement } from './entities/Measurement';
import { MeasureType } from './entities/enums/MeasureType';
import { uploadImage } from './utils/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const measurementService = app.get<MeasurementService>(MeasurementService);

  const measure = new Measurement();
  measure.customerCode = 'teste';
  measure.image = 'teste2';
  measure.measureType = MeasureType.GAS;
  measure.measureDatetime = new Date();

  const result = await measurementService.add(measure);
  console.log(result);

  const findAll = await measurementService.findAll();
  console.log(findAll);

  uploadImage('src/utils/temp/jetpack.jpg');
}
bootstrap();

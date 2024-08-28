import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from './entities/Measurement';
import { MeasurementService } from './services/MeasurementService';
import { MeasurementController } from './controllers/MeasurementController';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente acessíveis globalmente
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'h737pptc',
      database: 'shopper',
      entities: [Measurement],
      synchronize: true, // Sincroniza o schema do banco com as entidades, útil em desenvolvimento
    }),
    TypeOrmModule.forFeature([Measurement]),
  ],
  controllers: [AppController, MeasurementController],
  providers: [AppService, MeasurementService],
})
export class AppModule {}

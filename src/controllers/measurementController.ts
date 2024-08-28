import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { MeasurementService } from '../services/MeasurementService';
import { Measurement } from 'src/entities/Measurement';
import { MeasureType } from 'src/entities/enums/MeasureType';

@Controller('measure')
export class MeasurementController {
  constructor(private readonly measurementService: MeasurementService) {}

  @Get()
  findAll() {
    return this.measurementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.measurementService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.measurementService.remove(+id);
  }
  @Post()
  create(@Body() measurementData: Partial<Measurement>): Promise<Measurement> {
    const measureType =
      MeasureType[
        measurementData.measureType as unknown as keyof typeof MeasureType
      ];

    if (typeof measureType === 'undefined') {
      throw new BadRequestException('Invalid measure type');
    }
    measurementData.measureType = measureType;
    return this.measurementService.add(measurementData);
  }
}

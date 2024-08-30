import { Controller, Get, Param, Delete, Post, Body, Patch } from '@nestjs/common'
import { MeasurementService } from '../services/MeasurementService'
import { Measurement } from 'src/entities/Measurement'
import { ImageService } from 'src/services/ImageService'

@Controller('measure')
export class MeasurementController {
  constructor(
    private readonly measurementService: MeasurementService,
    private imageService: ImageService
  ) {}

  @Get()
  findAll() {
    return this.measurementService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.measurementService.findOne(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.measurementService.remove(+id)
  }

  @Post()
  async create(@Body() measurementData: Measurement): Promise<any> {
    const newMeasurement = await this.measurementService.add(measurementData)
    return {
      image_url: newMeasurement.image_url,
      measure_value: newMeasurement.measure_value,
      measure_uuid: newMeasurement.measure_uuid
    }
  }

  @Patch()
  async confirm(@Body() measureConfirm: ConfirmationMeasure): Promise<any> {
    if (await this.measurementService.confirm(measureConfirm)) {
      return {
        sucess: true
      }
    }
  }
}

export interface ConfirmationMeasure {
  measure_uuid: string
  confirmed_value: number
}

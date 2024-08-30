import { Controller, Get, Param, Post, Body, Patch, Query } from '@nestjs/common'
import { MeasurementService } from '../services/MeasurementService'
import { Measurement } from 'src/entities/Measurement'
import { ImageService } from 'src/services/ImageService'
import { MeasureType } from 'src/entities/enums/MeasureType'

@Controller('measure')
export class MeasurementController {
  constructor(
    private readonly measurementService: MeasurementService,
    private imageService: ImageService
  ) {}

  //Retorna umas lista com todos os Measurements
  @Get()
  findAll() {
    return this.measurementService.findAll()
  }

  // Retorna um Measure filtrado por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.measurementService.findOne(+id)
  }

  //Faz a criação de um novo Measure
  @Post()
  async create(@Body() measurementData: Measurement): Promise<any> {
    const newMeasurement = await this.measurementService.add(measurementData)
    return {
      image_url: newMeasurement.image_url,
      measure_value: newMeasurement.measure_value,
      measure_uuid: newMeasurement.measure_uuid
    }
  }

  //Confirma o measure_value
  @Patch()
  async confirm(@Body() measureConfirm: ConfirmationMeasure): Promise<any> {
    if (await this.measurementService.confirm(measureConfirm)) {
      return {
        sucess: true
      }
    }
  }

  //Retorna uma lista de measurements de acordo com customer code e/ou measure type
  @Get('/:customer_code/list')
  async listMeasures(
    @Param('customer_code') customerCode: string,
    @Query('measure_type') measureType?: string
  ): Promise<any> {
    const measures = await this.measurementService.findMeasuresByCustomer(customerCode, measureType)

    return {
      customer_code: customerCode,
      // eslint-disable-next-line prettier/prettier
      measures: measures.map((measure) => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: MeasureType[measure.measure_type],
        has_confirmed: measure.has_confirmed,
        image_url: measure.image_url
      }))
    }
  }
}
export interface ConfirmationMeasure {
  measure_uuid: string
  confirmed_value: number
}

import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  BadRequestException,
  HttpCode
} from '@nestjs/common'
import { MeasurementService } from '../services/MeasurementService'
import { Measurement } from 'src/entities/Measurement'
import { MeasureType } from 'src/entities/enums/MeasureType'
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
  @HttpCode(200)
  async create(@Body() measurementData: Measurement): Promise<any> {
    const measureType =
      MeasureType[
        measurementData.measureType as unknown as keyof typeof MeasureType
      ]

    measurementData.measureType = measureType
    if (this.verifyMeasurementData(measurementData)) {
      // processImage(MeasurementData.image, measurementData.customerCode)

      const newMeasurement =
        await this.imageService.processImage(measurementData)

      this.measurementService.add(newMeasurement)
      return {
        image_url: newMeasurement.imageUrl,
        measure_value: newMeasurement.measureValue,
        measure_uuid: newMeasurement.measureUuid
      }
    }
  }

  verifyMeasurementData(measurementData: Partial<Measurement>) {
    // 1. Validar dados
    const { image, customerCode, measureDatetime, measureType } =
      measurementData

    if (typeof measureType === 'undefined') {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'INVALID_MEASURE_TYPE',
        message: 'Measure Type informado é inválido'
      })
    }

    if (!image || !customerCode || !measureDatetime || !measureType) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'INVALID_DATA',
        message: 'Os dados fornecidos no corpo da requisição são inválidos'
      })
    }

    const base64Pattern = /^data:image\/(png|jpg|jpeg);base64,/
    if (!base64Pattern.test(image)) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'INVALID_DATA',
        message: 'Formato de Imagem Inválido'
      })
    }

    if (![MeasureType.WATER, MeasureType.GAS].includes(measureType)) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'INVALID_DATA',
        message:
          'Formato de medição inválido, só são aceitos dois valores: WATER e GAS'
      })
    } else {
      return true
    }
  }
}

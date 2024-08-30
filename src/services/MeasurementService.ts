import { Injectable, HttpException, HttpStatus } from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Measurement } from '../entities/Measurement'
import { v4 as uuidv4, validate, version } from 'uuid'
import { MeasureType } from 'src/entities/enums/MeasureType'
import { ImageService } from './ImageService'
import { ConfirmationMeasure } from '../controllers/MeasurementController'

@Injectable()
export class MeasurementService {
  constructor(
    @InjectRepository(Measurement)
    private measurementRepo: Repository<Measurement>,
    private imageService: ImageService
  ) {}

  async findAll(): Promise<Measurement[]> {
    return this.measurementRepo.find()
  }

  async findOne(id: number): Promise<Measurement> {
    return this.measurementRepo.findOneBy({ id })
  }

  async remove(id: number): Promise<void> {
    await this.measurementRepo.delete(id)
  }

  async add(measurementData: Measurement): Promise<Measurement> {
    measurementData.measure_type = MeasureType[measurementData.measure_type as unknown as keyof typeof MeasureType]
    measurementData.measure_datetime = new Date(measurementData.measure_datetime)

    const { image, customer_code, measure_datetime, measure_type } = measurementData

    if (!image || !customer_code || !measure_datetime || !measure_type) {
      this.defaultHttpException(400, 'INVALID_DATA', 'Os dados fornecidos no corpo da requisição são inválidos')
    }

    const base64Pattern = /^data:image\/(png|jpg|jpeg);base64,/
    if (!base64Pattern.test(image)) {
      this.defaultHttpException(400, 'INVALID_DATA', 'Formato de Imagem Inválido')
    }

    if (typeof measure_type === 'undefined' || ![MeasureType.WATER, MeasureType.GAS].includes(measure_type)) {
      this.defaultHttpException(400, 'INVALID_MEASURE_TYPE ', ' O Measure Type Informado é inválido')
    }

    const measureList = await this.findAll()
    for (const item of measureList) {
      if (
        item.measure_datetime.getFullYear() == measure_datetime.getFullYear() &&
        item.measure_datetime.getMonth() == measure_datetime.getMonth() &&
        item.measure_type == measure_type
      ) {
        this.defaultHttpException(409, 'DOUBLE_REPORT', ' Já existe uma leitura para este tipo no mês atual')
      }
    }

    const newMeasurement = await this.imageService.processImage(measurementData)

    if (newMeasurement.internal_file_path) {
      this.imageService.deleteImage(newMeasurement.internal_file_path)
    }

    try {
      newMeasurement.measure_uuid = this.createUuid()
      const measure = this.measurementRepo.create(newMeasurement)
      return this.measurementRepo.save(measure)
    } catch (error) {
      this.defaultHttpException(500, 'INTERNAL_SERVER_ERROR', 'INTERNAL SERVER ERROR')
      console.log(error)
    }
  }

  async update(id: number, updateData: Measurement): Promise<Measurement> {
    try {
      await this.measurementRepo.update(id, updateData)
      return this.measurementRepo.findOneBy({ id })
    } catch (error) {
      console.log(error)
    }
  }
  async findOneByUuid(measure_uuid: string): Promise<Measurement | null> {
    const measure = this.measurementRepo.findOneBy({ measure_uuid })
    if (!measure) {
      this.defaultHttpException(404, 'MEASURE_NOT_FOUND', 'Leitura não encontrada')
    }
    return measure
  }

  async confirm(measureConfirm: ConfirmationMeasure) {
    if (!measureConfirm.confirmed_value || !measureConfirm.measure_uuid) {
      this.defaultHttpException(409, 'INVALID_DATA', 'Os dados fornecidos no corpo da requisição são inválidos')
    }
    if (!this.isUUIDv4(measureConfirm.measure_uuid)) {
      this.defaultHttpException(400, 'INVALID_DATA', 'O código GUID é inválido')
    }
    const measure = await this.findOneByUuid(measureConfirm.measure_uuid)

    if (measure.has_confirmed == true) {
      this.defaultHttpException(409, 'CONFIRMATION_DUPLICATE', 'Leitura do mês já realizada')
    }
    measure.measure_value = measureConfirm.confirmed_value
    measure.has_confirmed = true
    return await this.update(measure.id, measure)
  }

  async findMeasuresByCustomer(customerCode: string, measureType?: string): Promise<Measurement[]> {
    if (measureType && !['WATER', 'GAS'].includes(measureType.toUpperCase())) {
      this.defaultHttpException(400, 'INVALID_TYPE', 'Tipo de medição não permitida')
    }
    let measures = await this.findAllMeasuresForCustomer(customerCode)
    if (measureType) {
      const newMeasureType = MeasureType[measureType.toUpperCase() as keyof typeof MeasureType]
      // eslint-disable-next-line prettier/prettier
      measures = measures.filter((measure) => measure.measure_type === newMeasureType)
    }
    if (!measures || measures.length === 0) {
      this.defaultHttpException(404, 'MEASURES_NOT_FOUND', 'Nenhuma leitura encontrada')
    }

    return measures
  }

  private async findAllMeasuresForCustomer(customer_code: string): Promise<Measurement[]> {
    return this.measurementRepo.findBy({ customer_code })
  }

  createUuid(): string {
    return uuidv4()
  }
  isUUIDv4(uuid: string) {
    return validate(uuid) && version(uuid) === 4
  }

  defaultHttpException(HttpStatus: HttpStatus, errorCode: string, message: string): void {
    throw new HttpException(
      {
        error_code: errorCode,
        error_description: message
      },
      HttpStatus
    )
  }
}

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

  //Retorna todos os Measurements do DB
  async findAll(): Promise<Measurement[]> {
    return this.measurementRepo.find()
  }
  // Retorna um Measurement com base no ID
  async findOne(id: number): Promise<Measurement> {
    return this.measurementRepo.findOneBy({ id })
  }
  // Remove um Measurement com base no ID
  async remove(id: number): Promise<void> {
    await this.measurementRepo.delete(id)
  }

  //Verifica dados e adiciona um Measurement no DB
  async add(measurementData: Measurement): Promise<Measurement> {
    const { image, customer_code, measure_datetime, measure_type } = measurementData

    if (!image || !customer_code || !measure_datetime || !measure_type) {
      this.defaultHttpException(400, 'INVALID_DATA', 'Os dados fornecidos no corpo da requisição são inválidos')
    }

    const base64Pattern = /^data:image\/(png|jpg|jpeg);base64,/
    if (!base64Pattern.test(measurementData.image)) {
      this.defaultHttpException(400, 'INVALID_DATA', 'Formato de Imagem Inválido')
    }
    measurementData.measure_type = MeasureType[measurementData.measure_type as unknown as keyof typeof MeasureType]
    if (
      typeof measurementData.measure_type === 'undefined' ||
      ![MeasureType.WATER, MeasureType.GAS].includes(measurementData.measure_type)
    ) {
      this.defaultHttpException(400, 'INVALID_MEASURE_TYPE ', ' O Measure Type Informado é inválido')
    }

    if (!this.isValidISODateTime(String(measurementData.measure_datetime))) {
      this.defaultHttpException(
        400,
        'INVALID_DATA',
        'A data não foi inserida no padrão ISO8601. Exemplo: "2025-01-01T16:30:00"'
      )
    }
    measurementData.measure_datetime = new Date(measurementData.measure_datetime)

    const measureList = await this.findAll()
    for (const item of measureList) {
      if (
        item.measure_datetime.getFullYear() == measurementData.measure_datetime.getFullYear() &&
        item.measure_datetime.getMonth() == measurementData.measure_datetime.getMonth() &&
        item.measure_type == measurementData.measure_type
      ) {
        this.defaultHttpException(409, 'DOUBLE_REPORT', ' Já existe uma leitura para este tipo no mês atual')
      }
    }

    const newMeasurement = await this.imageService.processImage(measurementData)

    if (newMeasurement.internal_file_path) {
      this.imageService.deleteImage(newMeasurement.internal_file_path)
    }

    newMeasurement.measure_uuid = await this.createUuid()
    const measure = await this.measurementRepo.create(newMeasurement)
    return this.measurementRepo.save(measure)
  }
  //Faz a atualização de um Measurement no DB
  async update(id: number, updateData: Measurement): Promise<Measurement> {
    await this.measurementRepo.update(id, updateData)
    return this.measurementRepo.findOneBy({ id })
  }
  // Busca um Measurement no DB com base no UUID
  async findOneByUuid(measure_uuid: string): Promise<Measurement | null> {
    const measure = this.measurementRepo.findOneBy({ measure_uuid })
    if (!measure) {
      this.defaultHttpException(404, 'MEASURE_NOT_FOUND', 'Leitura não encontrada')
    }
    return measure
  }

  // Verifica e confirma os dados do Measurement
  async confirm(measureConfirm: ConfirmationMeasure) {
    if (!measureConfirm.confirmed_value || !measureConfirm.measure_uuid) {
      this.defaultHttpException(409, 'INVALID_DATA', 'Os dados fornecidos no corpo da requisição são inválidos')
    }
    if (!this.isUUIDv4(measureConfirm.measure_uuid)) {
      this.defaultHttpException(400, 'INVALID_DATA', 'O código GUID é inválido')
    }
    const hasNumber = typeof measureConfirm.confirmed_value === 'number'
    if (!hasNumber) {
      this.defaultHttpException(400, 'INVALID_DATA', 'O valor de confirmação deve ser um número')
    }
    const measure = await this.findOneByUuid(measureConfirm.measure_uuid)

    if (measure.has_confirmed == true) {
      this.defaultHttpException(409, 'CONFIRMATION_DUPLICATE', 'Leitura do mês já realizada')
    }
    measure.measure_value = measureConfirm.confirmed_value
    measure.has_confirmed = true
    return await this.update(measure.id, measure)
  }

  // Retorna uma lista e Measures com base no customer code e/ou measure type
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

  //Retorna uma lista de Measurements com base no Customer code
  private async findAllMeasuresForCustomer(customer_code: string): Promise<Measurement[]> {
    return this.measurementRepo.findBy({ customer_code })
  }

  //Cria um UUID
  createUuid(): string {
    return uuidv4()
  }
  //Verifica se o UUID é válido
  isUUIDv4(uuid: string) {
    return validate(uuid) && version(uuid) === 4
  }
  //Função padrão pra Http Exceptions
  defaultHttpException(HttpStatus: HttpStatus, errorCode: string, message: string): void {
    throw new HttpException(
      {
        error_code: errorCode,
        error_description: message
      },
      HttpStatus
    )
  }
  // Valida um DateTime no padrão ISO
  isValidISODateTime(dateTimeString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|([+-]\d{2}:\d{2}))?$/
    if (!regex.test(dateTimeString)) return false
    const date = new Date(dateTimeString)
    return !isNaN(date.getTime()) && date.toISOString().startsWith(dateTimeString.split('T')[0])
  }
}

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Measurement } from '../entities/Measurement'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MeasurementService {
  constructor(
    @InjectRepository(Measurement)
    private measurementRepo: Repository<Measurement>
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

  async add(measurementData: Partial<Measurement>): Promise<Measurement> {
    const newMeasurement = this.measurementRepo.create(measurementData)
    return this.measurementRepo.save(newMeasurement)
  }

  async update(
    id: number,
    updateData: Partial<Measurement>
  ): Promise<Measurement> {
    await this.measurementRepo.update(id, updateData)
    return this.measurementRepo.findOneBy({ id })
  }

  createUuid(): string {
    return uuidv4()
  }
}

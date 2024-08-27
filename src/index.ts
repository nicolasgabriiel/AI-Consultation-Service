import { AppDataSource } from "./data-source"
import { MeasureType } from "./entities/enums/MeasureType"
import { Measurement } from "./entities/Measurement"

AppDataSource.initialize().then(async () => {

    console.log("Inserting a new measure into the database...")
    const measure = new Measurement()
    measure.customerCode = "teste"
    measure.image = "teste2"
    measure.measureType = MeasureType.GAS
    measure.measureDatetime = new Date()
    await AppDataSource.manager.save(measure)
    console.log("Saved a new measure with id: " + measure.id)

    console.log("Loading users from the database...")
    const measurements = await AppDataSource.manager.find(Measurement)
    console.log("Loaded measures: ", measurements)

    for (const m of measurements) {
        await AppDataSource.manager.remove(m);
    }

    const newMeasurements = await AppDataSource.manager.find(Measurement)
    console.log("Loaded new measures: ", newMeasurements)

}).catch(error => console.log(error))

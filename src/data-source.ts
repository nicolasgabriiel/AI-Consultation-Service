import "reflect-metadata"
import { DataSource } from "typeorm"
import { Measurement } from "./entities/Measurement"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "h737pptc",
    database: "shopper",
    synchronize: true,
    logging: false,
    entities: [Measurement],
    migrations: [],
    subscribers: [],
})

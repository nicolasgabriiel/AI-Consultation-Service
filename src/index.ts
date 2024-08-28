import { AppDataSource } from "./data-source"
import dotenv from 'dotenv'
import { uploadImage } from './utils/api'


AppDataSource.initialize().then(async () => {
    dotenv.config();
    
    uploadImage("src/utils/temp/jetpack.jpg")


}).catch(error => console.log(error))

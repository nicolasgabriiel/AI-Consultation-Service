import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Measurement } from "../entities/Measurement";
import { MeasureType } from "../entities/enums/MeasureType";

        import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Substitua esses valores com as credenciais da API LLM
const API_KEY = "AIzaSyBcX3lP_mP0Ckgnzy-CzZoDF1Ut5B1QAJ4";

export const uploadMeasurement = async (req: Request, res: Response) => {
    try {
        // 1. Validar dados
        const { image, customerCode, measureDatetime, measureType } = req.body;

        if (!image || !customerCode || !measureDatetime || !measureType) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        // Validar base64
        const base64Pattern = /^data:image\/(png|jpg|jpeg);base64,/;
        if (!base64Pattern.test(image)) {
            return res.status(400).json({ message: "Formato de imagem inválido" });
        }

        // Validar measureType
        if (![MeasureType.WATER, MeasureType.GAS].includes(measureType)) {
            return res.status(400).json({ message: "Tipo de medição inválido" });
        }

        // 2. Verificar se já existe uma leitura no mês
        // const existingMeasurement = await AppDataSource.manager.findOne(Measurement, {
        //     where: {
        //         customerCode,
        //         measureType,
        //         measureDatetime: {
        //             $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        //             $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        //         }
        //     }
        // });

        // if (existingMeasurement) {
        //     return res.status(400).json({ message: "Já existe uma leitura para este mês" });
        // }

        // 3. Integrar com a API LLM
        // const response = await axios.post(API_URL, { image }, {
        //     headers: {
        //         'Authorization': `Bearer ${API_KEY}`,
        //         'Content-Type': 'application/json'
        //     }
        // });

        // const { link, guid, value } = response.data;

        // // 4. Criar nova medição
        // const newMeasurement = new Measurement();
        // newMeasurement.image = link; // Use o link da API LLM
        // newMeasurement.customerCode = customerCode;
        // newMeasurement.measureDatetime = new Date(measureDatetime);
        // newMeasurement.measureType = measureType;

        // await AppDataSource.manager.save(newMeasurement);

        

        // Initialize GoogleAIFileManager with your API_KEY.
        const fileManager = new GoogleAIFileManager(process.env.API_KEY);

        // Upload the file and specify a display name.
        const uploadResponse = await fileManager.uploadFile("https://storage.googleapis.com/generativeai-downloads/images/jetpack.jpg", {
            mimeType: "image/jpeg",
            displayName: "Jetpack drawing",
        });

        // View the response.
        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        // Get the previously uploaded file's metadata.
        const getResponse = await fileManager.getFile(uploadResponse.file.name);

        // View the response.
        console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);

        // The following was placed here for relevance but should be added to imports.
        // To generate content, use this import path for GoogleGenerativeAI.
        // Note that this is a different import path than what you use for the File API.


        // Initialize GoogleGenerativeAI with your API_KEY.
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);

        const model = genAI.getGenerativeModel({
            // Choose a Gemini model.
            model: "gemini-1.5-pro",
        });

        // Upload file ...

        // Generate content using text and the URI reference for the uploaded file.
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: "Describe how this product might be manufactured." },
        ]);
        console.log(result.response.text())


        // Output the generated text to the console
        res.status(201).json({ message: "Medição criada com sucesso", data: result.response.text() });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};
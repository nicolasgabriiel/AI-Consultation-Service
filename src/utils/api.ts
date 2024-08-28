import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const uploadImage = (async (img: string) => {
        const fileManager = new GoogleAIFileManager(process.env.API_KEY);
        const uploadResponse = await fileManager.uploadFile(img, {
            mimeType: "image/jpeg",
            displayName: "Jetpack drawing",
        });

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        const getResponse = await fileManager.getFile(uploadResponse.file.name);
        console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);
    
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({model: "gemini-1.5-pro"});
    
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
    })
# Escolhe a imagem base
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto para o diretório de trabalho
COPY package*.json ./
RUN npm install
COPY . .

# Compila o código TypeScript para JavaScript
RUN npm run build


# Define o comando para iniciar a aplicação
CMD [ "npm", "run", "start:dev" ]

# AI CONSULTATION SERVICE

[![NPM](https://img.shields.io/npm/l/react)](https://github.com/nicolasgabriiel/AI-Consultation-Service/blob/main/LICENSE)

# Sobre o projeto

Este projeto é back-end de um serviço de leitura de imagens. São 3 três endpoints e uma integração com a API do Google Gemini. O serviço gerencia a leitura individualizada de consumo de água e gás. Para facilitar a coleta da informação, o serviço utiliza IA para
obter a medição através da foto de um medidor.

# Modelo conceitual

![Modelo Conceitual](https://uploaddeimagens.com.br/images/004/837/266/original/conceitualmodel.png?1725055486)

![Modelo Conceitual](https://uploaddeimagens.com.br/images/004/837/283/original/diagrama.png?1725056475)

# Exemplos de Requisições

<H3>URL para requisições: <b>${baseUrl}/measure</b></H3>

## POST

Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a
medida lida pela API

<H3>O corpo da requisição deve conter:</H3>

<pre>
{
 "image": "base64",
 "customer_code": "string",
 "measure_datetime": "datetime",
 "measure_type": "WATER" ou "GAS"
  }
</pre>

<H3>A resposta será algo como:</H3>
<pre>
{
 “image_url”: string,
 “measure_value”:integer,
 “measure_uuid”: string
}
</pre>

## PATCH

Responsável por confirmar ou corrigir o valor lido pelo LLM

<H3>O corpo da requisição deve conter:</H3>

<pre>
{
 "measure_uuid": "string",
 "confirmed_value": integer
}
</pre>

<H3>A resposta será algo como:</H3>
<pre>
{
 “success”: true
}
</pre>

## GET/${customer_code}/list

Responsável por listar as medidas realizadas por um determinado cliente. Ele opcionalmente pode receber um query parameter “measure_type”, que
deve ser “WATER” ou “GAS”

<H3>Como a requisição deve parecer:</H3>
<b>Ex. {base url}/${customer_code}/list?measure_type=WATER</b>

<H3>Ela irá retornar uma lista com todas as leituras realizadas.</H3>
<pre>
{
 “customer_code”: string,
 “measures”: [
 {
 “measure_uuid”: string,
 “measure_datetime”: datetime,
 “measure_type”: string,
 “has_confirmed”:boolean,
 “image_url”: string
 },
 {
 “measure_uuid”: string,
 “measure_datetime”: datetime,
 “measure_type”: string,
 “has_confirmed”:boolean,
 “image_url”: string
 }
 ]
}
</pre>

# Tecnologias utilizadas

- Node.js
- TypeScript
- Nest.JS
- Docker
- PostgreSQL
- [Gemini API](https://ai.google.dev/gemini-api/docs/vision?hl=pt-br&lang=node)

# Como executar o projeto

Pré-requisitos: Docker e [Gemini API Key](https://ai.google.dev/gemini-api/docs/api-key)

```bash
# clonar repositório
git clone https://github.com/nicolasgabriiel/AI-Consultation-Service

# executar o projeto em um container docker
docker compose up
```

Para o projeto funcionar é necessário criar um arquivo .env na pasta raiz do projeto e colocar a sua API Key do google gemini exatamente da maneira do exemplo a seguir:

<b>GEMINI_API_KEY=sua_chave_aqui</b>

Depois que os contêineres estiverem funcionando, você pode acessar o aplicativo NestJS visitando http://localhost:3000 no navegador e o pgAdmin visitando http://localhost:5050 no navegador. Os dados de acesso do pgAdmin são:

- admin@admin.com
- pgadmin4

Se quiser você pode alterar esses e outros dados no arquivo docker-compose.yml

# Autor

Nicolas Gabriel da Silva

https://www.linkedin.com/in/nicolasgabriiel/

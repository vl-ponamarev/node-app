FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/files /app/sessions

EXPOSE 4000

CMD ["node", "server.js"]

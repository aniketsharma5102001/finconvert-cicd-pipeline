FROM node:22-alpine
WORKDIR /app

RUN npm install -g npm@latest

COPY package*.json ./

RUN npm install --omit=dev

COPY src/ ./src/

USER node

EXPOSE 5000
CMD ["npm", "run", "start"]
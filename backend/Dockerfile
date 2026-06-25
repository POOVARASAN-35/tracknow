FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

RUN npm install -g pm2

COPY . .

EXPOSE 5000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]

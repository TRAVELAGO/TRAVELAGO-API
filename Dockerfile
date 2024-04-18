FROM node:21-alpine

LABEL version="1.0"

WORKDIR /app

COPY package.json ./

RUN yarn install --production

RUN yarn global add @nestjs/cli

COPY . .

RUN yarn build

CMD [ "node", "dist/main" ]

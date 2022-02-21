FROM node:17.5.0-alpine3.15 AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn add glob rimraf

RUN yarn

COPY . .

RUN npm run build

FROM node:17.5.0-alpine3.15 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET
ARG POSTGRES_URL
ARG PORT

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main"]
# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.18.1

FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

# Build
FROM base AS build

COPY --link package.json package-lock.json .
RUN npm install

COPY --link . .

RUN npm run build
RUN npm prune

# Run
FROM base

ENV NODE_ENV=production

COPY --from=build /app/app.cjs /app/app.cjs
COPY ./config/templates /app/config/templates

VOLUME /app/config

ENV DISCORD_TOKEN=

CMD [ "node", "./app.cjs" ]
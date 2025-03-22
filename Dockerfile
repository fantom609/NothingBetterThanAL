ARG NODE_IMAGE=node:20.11.1-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build --production

FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
ENV APP_KEY=wts1namNdV7FRcuOGe1zVR27VnQvHe5j
ENV DB_HOST=0.0.0.0
ENV DB_PORT=5432
ENV DB_USER=adonis
ENV DB_PASSWORD=secret
ENV DB_DATABASE=adonis_db

COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]

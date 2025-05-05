FROM node:lts-slim AS builder

WORKDIR /app

COPY ./package.json ./yarn.lock /app/

RUN yarn install --frozen-lockfile

COPY ./types /app/types
COPY ./tsconfig.app.json ./tsconfig.json ./tsconfig.node.json /app/

FROM builder AS frontend-builder

COPY ./src /app/src
COPY ./index.html ./postcss.config.js ./tailwind.config.ts ./vite.config.ts /app/

RUN yarn build

FROM builder AS backend-builder

COPY ./server /app/server

RUN yarn server:build

FROM node:lts-slim AS runner

WORKDIR /app

COPY ./package.json ./yarn.lock /app/

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean --force

COPY --from=backend-builder /app/dist/server /app/server
COPY --from=frontend-builder /app/dist /app/dist

EXPOSE 5174

ENTRYPOINT ["node", "./server/index.js"]

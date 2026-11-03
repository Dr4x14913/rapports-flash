# ---- Build ----
FROM node:22-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG ORIGIN
ENV ORIGIN=${ORIGIN}
RUN npm run build

# ---- Runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force && apk del python3 make g++
COPY --from=build /app/build ./build
COPY scripts ./scripts
COPY seed.json ./seed.json
RUN mkdir -p /data && chown -R node:node /data /app
USER node
ENV DATABASE_PATH=/data/app.db \
    SESSION_SECRET_FILE=/data/session-secret \
    BACKUP_DIR=/data/backups
EXPOSE 3000
CMD ["node", "build"]

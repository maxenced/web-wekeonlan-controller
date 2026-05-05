FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist/ ./dist/
COPY public/ ./public/
COPY src/views/ ./dist/views/
EXPOSE 3000
CMD ["node", "dist/index.js"]

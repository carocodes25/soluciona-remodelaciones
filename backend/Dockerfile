# Development stage
FROM node:20-alpine AS development

# Install OpenSSL 3 for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 4000 4001

CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:20-alpine AS build

# Install OpenSSL 3 for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL 3 for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000 4001

CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main"]

# 1. 빌드 환경 설정
FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g pnpm
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# ✅ 빌드 환경에서 환경변수 확인
RUN echo "📦 Builder NEXT_PUBLIC_API_BASE_URL = $NEXT_PUBLIC_API_BASE_URL"

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# 2. 프로덕션 환경 설정
FROM node:18-alpine

RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

# ✅ 여기서도 동일하게 환경변수 주입
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# ✅ 프로덕션 환경에서 환경변수 확인
RUN echo "🚀 Production NEXT_PUBLIC_API_BASE_URL = $NEXT_PUBLIC_API_BASE_URL"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["pnpm", "start"]

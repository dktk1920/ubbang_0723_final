FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g pnpm
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# 빌드 단계에서 반드시 devDependencies 설치되도록 NODE_ENV 환경변수 설정
ENV NODE_ENV=development

RUN echo "📦 Builder NEXT_PUBLIC_API_BASE_URL = $NEXT_PUBLIC_API_BASE_URL"

COPY package.json pnpm-lock.yaml* ./

# devDependencies 포함 설치 (--prod=false 옵션 추가)
RUN pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm run build

# 이하 프로덕션 단계는 동일
FROM node:18-alpine

RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN echo "🚀 Production NEXT_PUBLIC_API_BASE_URL = $NEXT_PUBLIC_API_BASE_URL"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["pnpm", "start"]

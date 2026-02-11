FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-https://unibus.online}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://unibus.online}
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start", "--", "-p", "3000"]

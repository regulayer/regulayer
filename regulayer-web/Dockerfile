FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build args
ARG DOMAIN
ENV DOMAIN=$DOMAIN

# Build Next.js app
RUN npm run build

# Start Next.js
CMD ["npm", "start"]

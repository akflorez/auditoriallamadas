FROM node:20-alpine

# Install build dependencies for better-sqlite3 (which compiles native C++ code)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies since tsx/typescript are in devDependencies)
RUN npm ci

# Copy prisma files and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start backend via tsx
CMD ["npm", "run", "dev"]

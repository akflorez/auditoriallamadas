FROM node:20-slim

# Install system dependencies needed to build native npm packages (like better-sqlite3) and run Prisma
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (native modules can now compile successfully)
RUN npm install

# Copy prisma files and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start backend via tsx
CMD ["npm", "run", "dev"]

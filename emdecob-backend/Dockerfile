FROM node:20-slim

# Install OpenSSL (needed by Prisma query engine)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (pre-compiled binaries of better-sqlite3 are downloaded automatically on Debian)
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

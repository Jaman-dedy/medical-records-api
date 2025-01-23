FROM node:18-alpine

WORKDIR /usr/src/app

# Add bash
RUN apk add --no-cache bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:dev"]
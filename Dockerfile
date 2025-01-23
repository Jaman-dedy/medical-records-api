FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache bash

# Copy everything needed for build
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies
RUN npm install

EXPOSE 3000

# Remove the postinstall script since we don't need to build again during development
CMD ["npm", "run", "start:dev"]
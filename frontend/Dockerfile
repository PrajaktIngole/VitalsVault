FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass in env variables at build time if necessary, usually Next.js handles it
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

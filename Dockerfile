FROM node:18-alpine

# Build arguments
ARG NODE_ENV=development
ARG PORT=3000

# Environment variables
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

WORKDIR /app

COPY package*.json ./

# Install dependencies and nodemon for development
RUN npm install && \
    npm install -g nodemon

COPY . .

EXPOSE ${PORT}

# Use nodemon instead of node for development
CMD ["nodemon", "--legacy-watch", "app.js"] 
FROM node as build
WORKDIR /home/node/app
COPY server /home/node/app
RUN npm install
RUN npx tsc
CMD node dist/app.js


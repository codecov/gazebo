# syntax = docker/dockerfile:1.3
FROM node:16.14.2-alpine3.15
ENV GENERATE_SOURCEMAP=false
RUN mkdir /home/workspace
COPY . /home/workspace
WORKDIR /home/workspace
RUN apk -U add git
RUN npm install
RUN npm run build && rm -f build/mockServiceWorker.js

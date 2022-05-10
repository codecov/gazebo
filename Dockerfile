# syntax = docker/dockerfile:1.3
FROM node:16.14.2-alpine3.15 as build
ENV GENERATE_SOURCEMAP=false
RUN mkdir /home/workspace
COPY . /home/workspace
WORKDIR /home/workspace
RUN apk -U add git
RUN npm install
RUN npm run build && rm -f build/mockServiceWorker.js

FROM alpine:3.15.4
RUN mkdir -p /var/www/app
COPY --from=build  /home/workspace/build/ /var/www/app/gazebo

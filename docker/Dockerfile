# syntax = docker/dockerfile:1.3
FROM node:18.8.0-alpine3.15 as npm
RUN mkdir /home/workspace
COPY package.json /home/workspace
WORKDIR /home/workspace
RUN apk -U add git
RUN npm install

FROM node:18.8.0-alpine3.15 as build
ARG REACT_APP_ENV_ARG
ARG REACT_APP_CODECOV_VERSION
ENV REACT_APP_ENV=$REACT_APP_ENV_ARG
ENV REACT_APP_CODECOV_VERSION=$REACT_APP_CODECOV_VERSION
ENV GENERATE_SOURCEMAP=false
RUN mkdir /home/workspace
COPY --from=npm /home/workspace/node_modules /home/workspace/node_modules
WORKDIR /home/workspace
RUN apk -U add git
COPY . /home/workspace
RUN npm run build && rm -f build/mockServiceWorker.js


FROM alpine:3.17
ARG REACT_APP_CODECOV_VERSION
ARG ENVIRONMENT
ARG COMMIT_SHA
ARG VERSION
ENV REACT_APP_CODECOV_VERSION=$REACT_APP_CODECOV_VERSION
ENV ENVIRONMENT $ENVIRONMENT
ENV BUILD_ID $COMMIT_SHA
ENV BUILD_VERSION $VERSION
ENV CODECOV_BASE_HOST=codecov.io
ENV CODECOV_API_HOST=api.codecov.io
ENV CODECOV_API_PORT=443
# Install packages and remove default server definition
RUN apk --no-cache add curl nginx gettext

# Setup document root
RUN mkdir -p /var/www/app

COPY docker/nginx.conf /etc/nginx/nginx.conf.template

RUN  addgroup -S application \
     && adduser -D -u 1000 -S codecov -G application

COPY --chown=codecov:application docker/start-nginx.sh /usr/bin/start-nginx

RUN chown -R codecov.application /var/www/app && \
  chown -R codecov.application /run && \
  chown -R codecov.application /var/lib/nginx && \
  chown -R codecov.application /var/log/nginx && \
  chmod +x /usr/bin/start-nginx && \
  chown codecov.application /etc/nginx/nginx.conf
# Switch to use a non-root user from here on
USER codecov

# Add application
WORKDIR /var/www/app
COPY --from=build --chmod=755 --chown=codecov:application /home/workspace/build/ /var/www/app/gazebo

EXPOSE 8080
CMD ["/usr/bin/start-nginx"]

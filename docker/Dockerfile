# syntax = docker/dockerfile:1.3
FROM            alpine:3.21 as uploader
USER            root
WORKDIR         /tmp
RUN             apk -U add gnupg curl
RUN             curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --import
RUN             mkdir uploader && \
  mkdir uploader/linux && \
  mkdir uploader/macos && \
  mkdir uploader/alpine && \
  mkdir uploader/windows

WORKDIR         /tmp/uploader
RUN             curl -s -o linux/codecov https://uploader.codecov.io/latest/linux/codecov && \
  curl -s -o linux/codecov.SHA256SUM https://uploader.codecov.io/latest/linux/codecov.SHA256SUM && \
  curl -s -o linux/codecov.SHA256SUM.sig https://uploader.codecov.io/latest/linux/codecov.SHA256SUM.sig && \
  curl -s -o alpine/codecov https://uploader.codecov.io/latest/alpine/codecov && \
  curl -s -o alpine/codecov.SHA256SUM https://uploader.codecov.io/latest/alpine/codecov.SHA256SUM && \
  curl -s -o alpine/codecov.SHA256SUM.sig https://uploader.codecov.io/latest/alpine/codecov.SHA256SUM.sig && \
  curl -s -o macos/codecov https://uploader.codecov.io/latest/macos/codecov && \
  curl -s -o macos/codecov.SHA256SUM https://uploader.codecov.io/latest/macos/codecov.SHA256SUM && \
  curl -s -o macos/codecov.SHA256SUM.sig https://uploader.codecov.io/latest/macos/codecov.SHA256SUM.sig && \
  curl -s -o windows/codecov.exe https://uploader.codecov.io/latest/windows/codecov.exe && \
  curl -s -o windows/codecov.exe.SHA256SUM https://uploader.codecov.io/latest/windows/codecov.exe.SHA256SUM && \
  curl -s -o windows/codecov.exe.SHA256SUM.sig https://uploader.codecov.io/latest/windows/codecov.exe.SHA256SUM.sig

# This gpg command is required for the next RUN to work. Something about gpg-agent I'd guess, but this seems to resolve it.
RUN             gpg --list-keys 
RUN             gpg --verify linux/codecov.SHA256SUM.sig linux/codecov.SHA256SUM && \ 
  gpg --verify alpine/codecov.SHA256SUM.sig alpine/codecov.SHA256SUM && \
  gpg --verify macos/codecov.SHA256SUM.sig macos/codecov.SHA256SUM && \
  gpg --verify windows/codecov.exe.SHA256SUM.sig windows/codecov.exe.SHA256SUM && \
  cd linux && sha256sum -c codecov.SHA256SUM && cd .. && \
  cd alpine && sha256sum -c codecov.SHA256SUM && cd .. && \
  cd macos && sha256sum -c codecov.SHA256SUM && cd .. && \
  cd windows && sha256sum -c codecov.exe.SHA256SUM

COPY            docker/index.html /tmp/uploader

FROM node:22-alpine3.21 as build
ARG REACT_APP_ENV_ARG
ARG REACT_APP_CODECOV_VERSION
ENV REACT_APP_ENV=$REACT_APP_ENV_ARG
ENV REACT_APP_CODECOV_VERSION=$REACT_APP_CODECOV_VERSION
ENV GENERATE_SOURCEMAP=false
RUN mkdir /home/workspace
WORKDIR /home/workspace
RUN apk -U add git
COPY . /home/workspace
RUN corepack enable
RUN yarn install
RUN yarn build && rm -f build/mockServiceWorker.js


FROM alpine:3.21
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
COPY docker/nginx-no-ipv6.conf /etc/nginx/nginx-no-ipv6.conf.template

RUN  addgroup -S application \
  && adduser -D -u 1000 -S codecov -G application

COPY --chown=codecov:application docker/start-nginx.sh /usr/bin/start-nginx

RUN chown -R codecov:application /var/www/app && \
  chown -R codecov:application /run && \
  chown -R codecov:application /var/lib/nginx && \
  chown -R codecov:application /var/log/nginx && \
  chmod +x /usr/bin/start-nginx && \
  chown codecov:application /etc/nginx/nginx.conf
# Switch to use a non-root user from here on
USER codecov

# Add application
WORKDIR /var/www/app
COPY --from=build --chmod=755 --chown=codecov:application /home/workspace/build/ /var/www/app/gazebo
COPY --from=uploader --chown=codecov:application /tmp/uploader/ /var/www/uploader/

EXPOSE 8080
CMD ["/usr/bin/start-nginx"]

# syntax=docker/dockerfile:1.3
ARG FRONTEND_IMAGE

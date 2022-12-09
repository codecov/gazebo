#!/bin/sh
set -e


if [ -z "$1" ];
then
  echo "Running for base: ${CODECOV_BASE_HOST} and api: ${CODECOV_API_HOST}"
  SCHEME_BASE=${CODECOV_SCHEME_SEARCH:=https}
  SCHEME=${CODECOV_SCHEME:=https}
  API_BASE=${CODECOV_API_HOST_SEARCH:=api.codecov.io}
  WEB_BASE=${CODECOV_HOST_SEARCH:=codecov.io}
  echo "Replacing ${SCHEME_BASE} for ${SCHEME} on ${API_BASE} and ${WEB_BASE}"
  sed -i "s/${SCHEME_BASE}:\/\/${API_BASE}/${SCHEME}:\/\/${CODECOV_API_HOST}/g" /var/www/app/gazebo/static/js/main.*
  sed -i "s/${SCHEME_BASE}:\/\/${WEB_BASE}/${SCHEME}:\/\/${CODECOV_BASE_HOST}/g" /var/www/app/gazebo/static/js/main.*

  export DOLLAR='$'
  envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
  nginx -g 'daemon off;'
else
  exec "$@"
fi



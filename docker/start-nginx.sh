#!/bin/sh
set -e


if [ -z "$1" ];
then
  echo "Codecov Frontend preflight started."
  echo "Running for base: ${CODECOV_BASE_HOST} and api: ${CODECOV_API_HOST}"
  SCHEME_BASE=${CODECOV_SCHEME_SEARCH:=https}
  SCHEME=${CODECOV_SCHEME:=https}
  API_BASE=${CODECOV_API_HOST_SEARCH:=api.codecov.io}
  WEB_BASE=${CODECOV_HOST_SEARCH:=codecov.io}
  echo "Replacing ${SCHEME_BASE} for ${SCHEME} on ${API_BASE} and ${WEB_BASE}"
  sed -i "s/${SCHEME_BASE}:\/\/${API_BASE}/${SCHEME}:\/\/${CODECOV_API_HOST}/g" /var/www/app/gazebo/static/js/main.*
  sed -i "s/${SCHEME_BASE}:\/\/${WEB_BASE}/${SCHEME}:\/\/${CODECOV_BASE_HOST}/g" /var/www/app/gazebo/static/js/main.*

  export DOLLAR='$'
  if [ "$CODECOV_FRONTEND_IPV6_DISABLED" ]; then
    echo 'Codecov frontend ipv6 disabled'
    envsubst < /etc/nginx/nginx-no-ipv6.conf.template > /etc/nginx/nginx.conf
  else
    envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
  fi
  echo "Codecov Frontend starting nginx"
  nginx -g 'daemon off;'
else
  exec "$@"
fi



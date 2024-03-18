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
  GHE_BASE=${CODECOV_GHE_HOST:=""}
  GLE_BASE=${CODECOV_GLE_HOST:=""}
  BBS_BASE=${CODECOV_BBS_HOST:=""}
  GHE_SCHEME_BASE=${CODECOV_GHE_SCHEME:=https}
  GLE_SCHEME_BASE=${CODECOV_GLE_SCHEME:=https}
  BBS_SCHEME_BASE=${CODECOV_BBS_SCHEME:=https}
  GITHUB_APP_BASE=${CODECOV_GITHUB_APP_SEARCH:=codecov}
  echo "Replacing ${SCHEME_BASE} for ${SCHEME} on ${API_BASE} and ${WEB_BASE}"
  sed -i "s/${SCHEME_BASE}:\/\/${API_BASE}/${SCHEME}:\/\/${CODECOV_API_HOST}/g" /var/www/app/gazebo/static/js/main.*
  sed -i "s/${SCHEME_BASE}:\/\/${WEB_BASE}/${SCHEME}:\/\/${CODECOV_BASE_HOST}/g" /var/www/app/gazebo/static/js/main.*
  if [[ -n "${GHE_BASE}" ]]; then
    echo "Replacing GHE ${GHE_SCHEME_BASE}://${GHE_BASE}"
    sed -i "s/r\.[a-zA-Z]\.GHE_URL/\"${GHE_SCHEME_BASE}:\/\/${GHE_BASE}\"/g" /var/www/app/gazebo/static/js/main.*
  fi
  if [[ -n "${GLE_BASE}" ]]; then
    echo "Replacing GLE ${GLE_SCHEME_BASE}://${GLE_BASE}"
    sed -i "s/r\.[a-zA-Z]\.GLE_URL/\"${GLE_SCHEME_BASE}:\/\/${GLE_BASE}\"/g" /var/www/app/gazebo/static/js/main.*
  fi
  if [[ -n "${BBS_BASE}" ]]; then
    echo "Replacing BBS ${BBS_SCHEME_BASE}://${BBS_BASE}"
    sed -i "s/r\.[a-zA-Z]\.BBS_URL/\"${BBS_SCHEME_BASE}:\/\/${BBS_BASE}\"/g" /var/www/app/gazebo/static/js/main.*
  fi
  if [ -n "${CODECOV_GITHUB_APP}" ]; then
    echo "Replacing Github App ${GITHUB_APP_BASE} with ${CODECOV_GITHUB_APP}"
    sed -i "s/GH_APP:\"${GITHUB_APP_BASE}\"/GH_APP:\"${CODECOV_GITHUB_APP}\"/g" /var/www/app/gazebo/static/js/main.*
  fi
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



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
  echo "Replacing ${SCHEME_BASE} for ${SCHEME} on ${API_BASE} and ${WEB_BASE}"
  sed -i "s/${SCHEME_BASE}:\/\/${API_BASE}/${SCHEME}:\/\/${CODECOV_API_HOST}/g" /var/www/app/gazebo/assets/*.js
  sed -i "s/${SCHEME_BASE}:\/\/${WEB_BASE}/${SCHEME}:\/\/${CODECOV_BASE_HOST}/g" /var/www/app/gazebo/assets/*.js
  if [[ -n "${GHE_BASE}" ]]; then
    echo "Replacing GHE ${GHE_SCHEME_BASE}://${GHE_BASE}"
    sed -i -r "s/[a-zA-Z]+\.GHE_URL/\"${GHE_SCHEME_BASE}:\/\/${GHE_BASE}\"/g" /var/www/app/gazebo/assets/*.js
  fi
  if [[ -n "${GLE_BASE}" ]]; then
    echo "Replacing GLE ${GLE_SCHEME_BASE}://${GLE_BASE}"
    sed -i -r "s/[a-zA-Z]+\.GLE_URL/\"${GLE_SCHEME_BASE}:\/\/${GLE_BASE}\"/g" /var/www/app/gazebo/assets/*.js
  fi
  if [[ -n "${BBS_BASE}" ]]; then
    echo "Replacing BBS ${BBS_SCHEME_BASE}://${BBS_BASE}"
    sed -i -r "s/[a-zA-Z]+\.BBS_URL/\"${BBS_SCHEME_BASE}:\/\/${BBS_BASE}\"/g" /var/www/app/gazebo/assets/*.js
  fi

  # Inject runtime config via window.configEnv
  if [[ -n "${CODECOV_GH_APP}" ]]; then
    echo "Setting GH_APP to ${CODECOV_GH_APP}"
    sed -i 's|<head>|<head><script>window.configEnv=window.configEnv||{};window.configEnv.GH_APP="'"${CODECOV_GH_APP}"'";</script>|' /var/www/app/gazebo/index.html
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



import pick from 'lodash/pick'

import { useUser } from 'services/user'

function setDataLayer(user) {
  const layer = {
    codecov: {
      app: {
        version: 'react-app',
      },
      user: {
        ...pick(user, 'ownerid', 'email', 'username', 'service', 'serviceId'),
        guest: !user,
      },
    },
  }
  window.dataLayer = [layer]
}

export function useTracking() {
  useUser({
    onSuccess: (user) => setDataLayer(user),
    onError: (data) => setDataLayer(null),
    suspense: false,
  })
}

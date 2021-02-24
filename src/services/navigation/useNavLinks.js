import { useRouteMatch } from 'react-router-dom'

import { appLinks, accountLinks } from './linkLocation'

const allLinks = { ...appLinks, ...accountLinks }

// TODO we need to add location storage or something for when params are not availble.
function useNavLinks(opts = {}) {
  const { params: routerParams } = useRouteMatch()

  const links = {}
  const params = {
    ...routerParams,
    ...opts,
  }

  for (const link in allLinks) {
    const { path: originalPath, createPath, ...values } = allLinks[link]
    const path = originalPath ? originalPath : createPath(params)

    links[link] = { ...values, path }
  }

  return links
}

export { useNavLinks }

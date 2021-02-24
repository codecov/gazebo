import { useRouteMatch } from 'react-router-dom'

import { appLinks } from './linkLocation'

// TODO we need to add location storage or something for when params are not availble.
function useNavLinks(opts = {}) {
  const { params: routerParams } = useRouteMatch()
  const links = {}
  const params = {
    ...routerParams,
    ...opts,
  }

  for (const link in appLinks) {
    const { createPath, ...values } = appLinks[link]
    links[link] = { ...values, path: createPath(params) }
  }

  return links
}

function useStaticNavLinks() {
  return {
    root: { path: '/', isExternalLink: true },
    signOut: {
      text: 'Sign Out',
      path: '/sign-out',
      isExternalLink: true,
    },
    signIn: {
      text: 'Log in',
      path: '/sign-in',
      isExternalLink: true,
    },
    terms: { text: 'Terms', path: '/terms', isExternalLink: true },
    privacy: { text: 'Privacy', path: '/privacy', isExternalLink: true },
    security: { text: 'Security', path: '/security', isExternalLink: true },
    gdpr: { text: 'GDPR', path: '/gdpr', isExternalLink: true },
    shop: { text: 'Shop', path: '/shop', isExternalLink: true },
    pricing: { text: 'Pricing', path: '/pricing', isExternalLink: true },
    support: { text: 'Support', path: '/support', isExternalLink: true },
    docs: {
      text: 'Docs',
      path: 'https://docs.codecov.io/',
      isExternalLink: true,
    },
    enterprise: {
      text: 'Enterprise',
      path: '/enterprise',
      isExternalLink: true,
    },
    githubMarketplace: {
      path: 'https://github.com/marketplace/codecov',
      external: true,
      text: 'Manage billing in GitHub',
    },
    freshdesk: {
      path: 'https://codecov.freshdesk.com/support/home',
      external: true,
      text: 'Contact Support',
    },
  }
}

export { useNavLinks, useStaticNavLinks }

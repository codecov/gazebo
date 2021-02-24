import { useRouteMatch } from 'react-router-dom'

// TODO we need to add location storage or something for when params are not availble.
function useNavLinks(opts = {}) {
  const { params } = useRouteMatch()
  // Combine router params with passed override options.
  const { provider, owner, repo, id } = {
    ...params,
    ...opts,
  }

  return {
    provider: {
      path: `/${provider}`,
      isExternalLink: true,
    },
    owner: {
      path: `/${provider}/${owner}`,
      isExternalLink: true,
    },
    repo: {
      path: `/${provider}/${owner}/${repo}`,
      isExternalLink: true,
    },
    account: {
      text: 'Personal Settings',
      path: `/account/${provider}/${owner}`,
      isExternalLink: false,
    },
    accountAdmin: {
      text: 'Admin',
      path: `/account/${provider}/${owner}`,
      isExternalLink: false,
    },
    yamlTab: {
      text: 'YAML',
      path: `/account/${provider}/${owner}/yaml`,
      isExternalLink: false,
    },
    accessTab: {
      text: 'Access',
      path: `/account/${provider}/${owner}/access`,
      isExternalLink: false,
    },
    billingAndUsers: {
      text: 'Billing & Users',
      path: `/account/${provider}/${owner}/billing`,
      isExternalLink: false,
    },
    upgradePlan: {
      path: `/account/${provider}/${owner}/billing/upgrade`,
      isExternalLink: false,
    },
    cancelPlan: {
      path: `/account/${provider}/${owner}/billing/cancel`,
      isExternalLink: false,
    },
    invoiceTab: {
      path: `/account/${provider}/${owner}/invoices`,
      isExternalLink: false,
    },
    invoiceDetail: {
      path: `/account/${provider}/${owner}/invoices/${id}`,
      isExternalLink: false,
    },
  }
}

// Seperate hook which doesn't unessisarily use the router. (Easier unit tests)
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

import { useRouteMatch } from 'react-router-dom'

function useNavLinks() {
  const { params } = useRouteMatch()
  const { provider: p, owner: o, repo: r, id: i } = params

  return {
    provider: {
      path: ({ provider = p } = { provider: p }) => `/${provider}`,
      isExternalLink: true,
    },
    owner: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/${provider}/${owner}`,
      isExternalLink: true,
    },
    repo: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}`,
      isExternalLink: true,
    },
    account: {
      text: 'Personal Settings',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}`,
      isExternalLink: false,
    },
    accountAdmin: {
      text: 'Admin',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}`,
      isExternalLink: false,
    },
    yamlTab: {
      text: 'YAML',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/yaml`,
      isExternalLink: true,
    },
    accessTab: {
      text: 'Access',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/access`,
      isExternalLink: true,
    },
    billingAndUsers: {
      text: 'Billing & Users',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/billing`,
      isExternalLink: false,
    },
    upgradePlan: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/billing/upgrade`,
      isExternalLink: false,
    },
    cancelPlan: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/billing/cancel`,
      isExternalLink: false,
    },
    invoiceTab: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/invoices`,
      isExternalLink: false,
      text: 'Invoice overview',
    },
    invoiceDetail: {
      path: (
        { provider = p, owner = o, id = i } = { provider: p, owner: o, id: i }
      ) => `/account/${provider}/${owner}/invoices/${id}`,
      isExternalLink: false,
    },
  }
}

// Seperate function which doesn't unessisarily use the router.
function useStaticNavLinks() {
  return {
    root: { path: () => '/', isExternalLink: true },
    signOut: {
      text: 'Sign Out',
      path: () => '/sign-out',
      isExternalLink: true,
    },
    signIn: {
      text: 'Log in',
      path: () => '/sign-in',
      isExternalLink: true,
    },
    terms: { text: 'Terms', path: () => '/terms', isExternalLink: true },
    privacy: { text: 'Privacy', path: () => '/privacy', isExternalLink: true },
    security: {
      text: 'Security',
      path: () => '/security',
      isExternalLink: true,
    },
    gdpr: { text: 'GDPR', path: () => '/gdpr', isExternalLink: true },
    shop: { text: 'Shop', path: () => '/shop', isExternalLink: true },
    pricing: { text: 'Pricing', path: () => '/pricing', isExternalLink: true },
    support: { text: 'Support', path: () => '/support', isExternalLink: true },
    docs: {
      text: 'Docs',
      path: () => 'https://docs.codecov.io/',
      isExternalLink: true,
    },
    enterprise: {
      text: 'Enterprise',
      path: () => '/enterprise',
      isExternalLink: true,
    },
    github: {
      path: () => 'https://github.com/marketplace/codecov',
      isExternalLink: true,
      text: 'Continue to GitHub to manage repository integration',
    },
    githubMarketplace: {
      path: () => 'https://github.com/marketplace/codecov',
      isExternalLink: true,
      text: 'View in GitHub Marketplace',
    },
    freshdesk: {
      path: () => 'https://codecov.freshdesk.com/support/home',
      isExternalLink: true,
      text: 'Contact Support',
    },
  }
}

export { useNavLinks, useStaticNavLinks }

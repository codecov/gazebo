import { useRouteMatch } from 'react-router-dom'

function useNavLinks() {
  const { params } = useRouteMatch()
  const { provider: p, owner: o, repo: r, id: i } = params

  return {
    signOut: {
      text: 'Sign Out',
      path: ({ provider = p } = { provider: p }) =>
        `https://codecov.io/logout/${provider}`,
      isExternalLink: true,
    },
    signIn: {
      text: 'Log in',
      path: ({ provider = p } = { provider: p }) =>
        `https://codecov.io/login/${provider}`,
      isExternalLink: true,
    },
    provider: {
      path: ({ provider = p } = { provider: p }) => `/${provider}`,
      isExternalLink: true,
    },
    owner: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/${provider}/${owner}`,
      isExternalLink: true,
    },
    // Like owner but internal
    ownerInternal: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/${provider}/${owner}`,
      isExternalLink: false,
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
    root: { path: () => 'https://about.codecov.io', isExternalLink: true },
    terms: {
      text: 'Terms',
      path: () => 'https://codecov.io/terms',
      isExternalLink: true,
    },
    privacy: {
      text: 'Privacy',
      path: () => 'https://codecov.io/privacy',
      isExternalLink: true,
    },
    security: {
      text: 'Security',
      path: () => 'https://codecov.io/security',
      isExternalLink: true,
    },
    gdpr: {
      text: 'GDPR',
      path: () => 'https://codecov.io/gdpr',
      isExternalLink: true,
    },
    shop: {
      text: 'Shop',
      path: () => 'https://codecov.io/shop',
      isExternalLink: true,
    },
    pricing: {
      text: 'Pricing',
      path: () => 'https://codecov.io/pricing',
      isExternalLink: true,
    },
    support: {
      text: 'Support',
      path: () => 'https://codecov.io/support',
      isExternalLink: true,
    },
    docs: {
      text: 'Docs',
      path: () => 'https://docs.codecov.io/',
      isExternalLink: true,
    },
    enterprise: {
      text: 'Enterprise',
      path: () => 'https://codecov.io/enterprise',
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
    blog: {
      // TODO add blog to footer
      path: () => 'https://about.codecov.io/blog',
      isExternalLink: true,
      text: 'Blog',
    },
  }
}

export { useNavLinks, useStaticNavLinks }

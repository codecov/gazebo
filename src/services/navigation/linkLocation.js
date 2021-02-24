export const appLinks = {
  root: { path: '/', isExternalLink: true },
  provider: {
    createPath: ({ provider }) => `/${provider}`,
    isExternalLink: true,
  },
  owner: {
    createPath: ({ provider, owner }) => `/${provider}/${owner}`,
    isExternalLink: true,
  },
  repo: {
    createPath: ({ provider, owner, repo }) => `/${provider}/${owner}/${repo}`,
    isExternalLink: true,
  },
  account: {
    text: 'Personal Settings',
    createPath: ({ provider, owner }) => `/account/${provider}/${owner}`,
    isExternalLink: false,
  },
  signOut: {
    text: 'Sign Out',
    path: '/sign-out',
    isExternalLink: true,
  },
  signIn: {
    text: 'Sign In',
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
  enterprise: { text: 'Enterprise', path: '/enterprise', isExternalLink: true },
}

export const accountLinks = {
  root: {
    text: 'Admin',
    createPath: ({ provider, owner }) => `/account/${provider}/${owner}`,
    isExternalLink: false,
  },
  yamlTab: {
    text: 'YAML',
    createPath: ({ provider, owner }) => `/account/${provider}/${owner}/yaml`,
    isExternalLink: false,
  },
  accessTab: {
    text: 'Access',
    createPath: ({ provider, owner }) => `/account/${provider}/${owner}/access`,
    isExternalLink: false,
  },
  billingAndUsers: {
    text: 'Billing & Users',
    createPath: ({ provider, owner }) =>
      `/account/${provider}/${owner}/billing`,
    isExternalLink: false,
  },
  upgradePlan: {
    createPath: ({ provider, owner }) =>
      `/account/${provider}/${owner}/billing/upgrade`,
    isExternalLink: false,
  },
  cancelPlan: {
    createPath: ({ provider, owner }) =>
      `/account/${provider}/${owner}/billing/cancel`,
    isExternalLink: false,
  },
  invoiceTab: {
    createPath: ({ provider, owner }) =>
      `/account/${provider}/${owner}/invoices`,
    isExternalLink: false,
  },
  invoiceDetail: {
    createPath: ({ provider, owner, id }) =>
      `/account/${provider}/${owner}/invoices/${id}`,
    isExternalLink: false,
  },
}

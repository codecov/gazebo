export const appLinks = {
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
  accountAdmin: {
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

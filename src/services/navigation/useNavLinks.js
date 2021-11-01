import pick from 'lodash/pick'
import qs from 'qs'
import { useParams, useLocation } from 'react-router-dom'

import config from 'config'

function forwardMarketingTag(search) {
  const queryParams = qs.parse(search, {
    ignoreQueryPrefix: true,
  })
  return pick(queryParams, [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_department',
  ])
}

function useNavLinks() {
  const { search } = useLocation()
  const { provider: p, owner: o, repo: r, id: i } = useParams()

  return {
    signOut: {
      text: 'Sign Out',
      path: ({ provider = p } = { provider: p }) =>
        `${config.BASE_URL}/logout/${provider}`,
      isExternalLink: true,
    },
    signIn: {
      text: 'Log in',
      path: ({ provider = p, privateScope, to } = { provider: p }) => {
        const query = qs.stringify(
          {
            to,
            private: privateScope,
            ...forwardMarketingTag(search),
          },
          { addQueryPrefix: true }
        )
        return `${config.BASE_URL}/login/${provider}${query}`
      },
      isExternalLink: true,
    },
    signUp: {
      text: 'Sign Up',
      path: () => {
        const params = qs.stringify(forwardMarketingTag(search), {
          addQueryPrefix: true,
        })
        return `${config.MARKETING_BASE_URL}/sign-up/${params}`
      },
      isExternalLink: true,
    },
    provider: {
      path: ({ provider = p } = { provider: p }) => `/${provider}`,
      isExternalLink: false,
    },
    providerAddRepo: {
      path: ({ provider = p } = { provider: p }) => `/${provider}/+`,
      isExternalLink: false,
    },
    owner: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/${provider}/${owner}`,
      isExternalLink: false,
    },
    ownerAddRepo: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/${provider}/${owner}/+`,
      isExternalLink: false,
    },
    analytics: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `${config.BASE_URL}/analytics/${provider}/${owner}`,
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
      text: 'Global YAML',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/yaml`,
      isExternalLink: false,
    },
    accessTab: {
      text: 'Access',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/access`,
      isExternalLink: true,
    },
    internalAccessTab: {
      text: 'Access',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/access`,
      isExternalLink: false,
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
    commits: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/commits`,
      isExternalLink: true,
      text: 'Commits',
    },
    commit: {
      path: (
        { provider = p, owner = o, repo = r, commit } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/commit/${commit}`,
      isExternalLink: false,
      text: 'Commits',
    },
    commitFile: {
      path: (
        { provider = p, owner = o, repo = r, commit, path } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/commit/${commit}/${path}`,
      isExternalLink: false,
      text: 'Commits',
    },
    pull: {
      path: (
        { provider = p, owner = o, repo = r, pullid } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/pull/${pullid}`,
      isExternalLink: true,
      text: 'Commits',
    },
    treeView: {
      path: (
        { provider = p, owner = o, repo = r, tree, ref } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        if (!tree || !ref) {
          return `/${provider}/${owner}/${repo}/tree/`
        } else {
          return `/${provider}/${owner}/${repo}/tree/${ref}/${tree}`
        }
      },
      isExternalLink: true,
      text: 'Tree View',
    },
    new: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/new`,
      isExternalLink: false,
      text: 'New',
    },
    overview: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}`,
      isExternalLink: true,
      text: 'Overview',
    },
    branches: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/branches`,
      isExternalLink: true,
      text: 'Branches',
    },
    pulls: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/pulls`,
      isExternalLink: true,
      text: 'Pulls',
    },
    compare: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/compare`,
      isExternalLink: true,
      text: 'Compare',
    },
    settings: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/settings`,
      isExternalLink: true,
      text: 'Settings',
    },
  }
}

// Seperate function which doesn't unessisarily use the router.
function useStaticNavLinks() {
  return {
    root: { path: () => `${config.MARKETING_BASE_URL}`, isExternalLink: true },
    demo: {
      text: 'Demo',
      path: () => `${config.MARKETING_BASE_URL}/demo`,
      isExternalLink: true,
    },
    freeTrial: {
      text: 'Trial',
      path: () => `${config.MARKETING_BASE_URL}/trial`,
      isExternalLink: true,
    },
    terms: {
      text: 'Terms',
      path: () => `${config.MARKETING_BASE_URL}/terms`,
      isExternalLink: true,
    },
    privacy: {
      text: 'Privacy',
      path: () => `${config.MARKETING_BASE_URL}/privacy`,
      isExternalLink: true,
    },
    security: {
      text: 'Security',
      path: () => `${config.MARKETING_BASE_URL}/security`,
      isExternalLink: true,
    },
    gdpr: {
      text: 'GDPR',
      path: () => `${config.MARKETING_BASE_URL}/gdpr`,
      isExternalLink: true,
    },
    pricing: {
      text: 'Pricing',
      path: () => `${config.MARKETING_BASE_URL}/pricing`,
      isExternalLink: true,
    },
    support: {
      text: 'Support',
      path: () => `https://codecov.freshdesk.com/support/home`,
      isExternalLink: true,
    },
    docs: {
      text: 'Docs',
      path: () => 'https://docs.codecov.io/',
      isExternalLink: true,
    },
    oauthTroubleshoot: {
      text: 'OAuth Troubleshoot',
      path: () =>
        'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting',
      isExternalLink: true,
    },
    enterprise: {
      text: 'Self Hosted',
      path: () => `${config.MARKETING_BASE_URL}/self-hosted`,
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
      path: () => `${config.MARKETING_BASE_URL}/blog`,
      isExternalLink: true,
      text: 'Blog',
    },
    legacyUI: {
      path: ({ pathname }) => config.BASE_URL + pathname,
      isExternalLink: true,
      text: 'Legacy User Interface',
    },
    sales: {
      path: () => `${config.MARKETING_BASE_URL}/sales`,
      isExternalLink: true,
      text: 'Sales Contact',
    },
    uploader: {
      path: () => 'https://docs.codecov.com/docs/codecov-uploader',
      isExternalLink: true,
      text: 'Codecov Uploader',
    },
    integrityCheck: {
      path: () =>
        'https://docs.codecov.com/docs/codecov-uploader#integrity-checking-the-uploader',
      isExternalLink: true,
      text: 'Uploader Integrity Check',
    },
  }
}

export { useNavLinks, useStaticNavLinks }

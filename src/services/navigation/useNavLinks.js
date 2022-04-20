import Cookie from 'js-cookie'
import qs from 'qs'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

function useNavLinks() {
  const { provider: p, owner: o, repo: r, id: i, pullId: pi } = useParams()
  const { gazeboRepoTabs, gazeboPullRequestPage } = useFlags({
    gazeboRepoTabs: false,
    gazeboPullRequestPage: false,
  })

  const utmCookie = Cookie.get('utmParams')
  const utmCookieObj = qs.parse(utmCookie, {
    ignoreQueryPrefix: true,
  })

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
            ...utmCookieObj,
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
        const params = qs.stringify(utmCookieObj, {
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
        `/analytics/${provider}/${owner}`,
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
      isExternalLink: gazeboRepoTabs,
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
      isExternalLink: gazeboRepoTabs,
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
      text: 'Commit',
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
      text: 'Commit File',
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
      isExternalLink: gazeboRepoTabs,
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
      isExternalLink: gazeboRepoTabs,
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
      isExternalLink: gazeboRepoTabs,
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
      isExternalLink: gazeboRepoTabs,
      text: 'Pulls',
    },
    pullDetail: {
      path: (
        { provider = p, owner = o, repo = r, pullId = pi } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
        }
      ) => `/${provider}/${owner}/${repo}/pull/${pullId}`,
      isExternalLink: gazeboPullRequestPage,
      text: 'Pull',
    },
    settings: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/settings`,
      isExternalLink: gazeboRepoTabs,
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
      openNewTab: true,
    },
    freeTrial: {
      text: 'Trial',
      path: () => `${config.MARKETING_BASE_URL}/trial`,
      isExternalLink: true,
      openNewTab: true,
    },
    terms: {
      text: 'Terms',
      path: () => `${config.MARKETING_BASE_URL}/terms`,
      isExternalLink: true,
      openNewTab: true,
    },
    privacy: {
      text: 'Privacy',
      path: () => `${config.MARKETING_BASE_URL}/privacy`,
      isExternalLink: true,
      openNewTab: true,
    },
    security: {
      text: 'Security',
      path: () => `${config.MARKETING_BASE_URL}/security`,
      isExternalLink: true,
      openNewTab: true,
    },
    gdpr: {
      text: 'GDPR',
      path: () => `${config.MARKETING_BASE_URL}/gdpr`,
      isExternalLink: true,
      openNewTab: true,
    },
    pricing: {
      text: 'Pricing',
      path: () => `${config.MARKETING_BASE_URL}/pricing`,
      isExternalLink: true,
      openNewTab: true,
    },
    support: {
      text: 'Support',
      path: () => `https://codecov.freshdesk.com/support/home`,
      isExternalLink: true,
      openNewTab: true,
    },
    docs: {
      text: 'Docs',
      path: () => 'https://docs.codecov.io/',
      isExternalLink: true,
      openNewTab: true,
    },
    oauthTroubleshoot: {
      text: 'OAuth Troubleshoot',
      path: () =>
        'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting',
      isExternalLink: true,
      openNewTab: true,
    },
    userAppManagePage: {
      text: 'User App Manage/Access Page',
      path: () =>
        'https://github.com/settings/connections/applications/c68c81cbfd179a50784a',
      isExternalLink: true,
      openNewTab: true,
    },
    enterprise: {
      text: 'Self Hosted',
      path: () => `${config.MARKETING_BASE_URL}/self-hosted`,
      isExternalLink: true,
      openNewTab: true,
    },
    github: {
      path: () => 'https://github.com/marketplace/codecov',
      isExternalLink: true,
      openNewTab: true,
      text: 'Continue to GitHub to manage repository integration',
    },
    githubMarketplace: {
      path: () => 'https://github.com/marketplace/codecov',
      isExternalLink: true,
      text: 'View in GitHub Marketplace',
      openNewTab: true,
    },
    freshdesk: {
      path: () => 'https://codecov.freshdesk.com/support/home',
      isExternalLink: true,
      text: 'Contact Support',
      openNewTab: true,
    },
    blog: {
      // TODO add blog to footer
      path: () => `${config.MARKETING_BASE_URL}/blog`,
      isExternalLink: true,
      text: 'Blog',
      openNewTab: true,
    },
    legacyUI: {
      path: ({ pathname }) => config.BASE_URL + pathname,
      isExternalLink: true,
      text: 'Legacy User Interface',
      openNewTab: true,
    },
    sales: {
      path: () => `${config.MARKETING_BASE_URL}/sales`,
      isExternalLink: true,
      text: 'Sales Contact',
      openNewTab: true,
    },
    uploader: {
      path: () => 'https://docs.codecov.com/docs/codecov-uploader',
      isExternalLink: true,
      text: 'Codecov Uploader',
      openNewTab: true,
    },
    integrityCheck: {
      path: () =>
        'https://docs.codecov.com/docs/codecov-uploader#integrity-checking-the-uploader',
      isExternalLink: true,
      text: 'Uploader Integrity Check',
      openNewTab: true,
    },
    codecovGithuhApp: {
      path: () => 'https://github.com/apps/codecov',
      isExternalLink: true,
      text: 'Codecov Github App',
      openNewTab: true,
    },
    teamBot: {
      path: () => 'https://docs.codecov.com/docs/team-bot',
      isExternalLink: true,
      text: 'Team Bot',
      openNewTab: true,
    },
    flags: {
      text: 'Flags',
      path: () => 'https://docs.codecov.com/docs/flags',
      isExternalLink: true,
      openNewTab: true,
    },
  }
}

export { useNavLinks, useStaticNavLinks }

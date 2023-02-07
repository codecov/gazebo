import Cookie from 'js-cookie'
import qs from 'qs'
import { useParams } from 'react-router-dom'

import config from 'config'

export function useNavLinks() {
  const { provider: p, owner: o, repo: r, id: i, pullId: pi } = useParams()

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
    owner: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/${provider}/${owner}`,
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
    },
    account: {
      text: 'Personal Settings',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}`,
      isExternalLink: false,
    },
    planTab: {
      text: 'Plan',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/plan/${provider}/${owner}`,
      isExternalLink: false,
    },
    membersTab: {
      text: 'Members',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/members/${provider}/${owner}`,
      isExternalLink: false,
    },
    upgradeOrgPlan: {
      text: 'Upgrade Plan',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/plan/${provider}/${owner}/upgrade`,
      isExternalLink: false,
    },
    cancelOrgPlan: {
      text: 'Cancel Plan',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/plan/${provider}/${owner}/cancel`,
      isExternalLink: false,
    },
    invoicesPage: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/plan/${provider}/${owner}/invoices`,
      isExternalLink: false,
      text: 'Invoices',
    },
    invoiceDetailsPage: {
      path: (
        { provider = p, owner = o, id = i } = { provider: p, owner: o, id: i }
      ) => `/plan/${provider}/${owner}/invoices/${id}`,
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
    commits: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/commits`,
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
        if (!tree && !ref) {
          return `/${provider}/${owner}/${repo}/tree/`
        } else if (!tree) {
          return `/${provider}/${owner}/${repo}/tree/${ref}/`
        } else {
          return `/${provider}/${owner}/${repo}/tree/${ref}/${tree}`
        }
      },
      isExternalLink: false,
      text: 'Tree View',
    },
    fileViewer: {
      path: (
        { provider = p, owner = o, repo = r, ref, tree } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/blob/${ref}/${tree}`,
      isExternalLink: false,
      text: 'File Viewer',
    },
    commitTreeView: {
      path: (
        { provider = p, owner = o, repo = r, tree, commit } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        if (!tree) {
          return `/${provider}/${owner}/${repo}/commit/${commit}/tree`
        } else {
          return `/${provider}/${owner}/${repo}/commit/${commit}/tree/${tree}`
        }
      },
      isExternalLink: false,
      text: 'Commit Tree View',
    },
    commitFileView: {
      path: (
        { provider = p, owner = o, repo = r, tree, commit } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        return `/${provider}/${owner}/${repo}/commit/${commit}/blob/${tree}`
      },
      isExternalLink: false,
      text: 'Commit File View',
    },
    new: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/new`,
      text: 'New',
    },
    newOtherCI: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/new/other-ci`,
      text: 'Other CI',
    },
    overview: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}`,
      text: 'Overview',
    },
    flagsTab: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/flags`,
      isExternalLink: false,
      text: 'Flags',
    },
    branches: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/branches`,
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
      text: 'Impacted Files',
    },
    settings: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/settings`,
      text: 'Settings',
    },
    settingsGeneral: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/settings`,
      text: 'General',
    },
    settingsYaml: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/settings/yaml`,
      text: 'Yaml',
    },
    settingsBadge: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,

          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/settings/badge`,
      text: 'Badges & Graphs',
    },
    feedback: {
      text: 'Feedback',
      path: ({ provider = p, ref } = { provider: p, ref: null }) => {
        if (ref) {
          return `/${provider}/feedback?ref=${encodeURIComponent(ref)}`
        }
        return `/${provider}/feedback`
      },
      isExternalLink: false,
    },
    prevLink: {
      text: 'Back',
      path: ({ provider = p, ref } = { provider: p, ref: null }) => {
        if (ref) {
          return decodeURIComponent(ref)
        }
        return `/${provider}`
      },
      isExternalLink: false,
    },
    orgUploadToken: {
      text: 'Global Upload Token',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}/orgUploadToken`,
      isExternalLink: false,
    },
    access: {
      text: 'Access',
      path: ({ provider = p } = { provider: p }) => {
        return `/admin/${provider}/access`
      },
      isExternalLink: false,
    },
    users: {
      text: 'Users',
      path: ({ provider = p } = { provider: p }) => {
        return `/admin/${provider}/users`
      },
      isExternalLink: false,
    },
    profile: {
      text: 'Profile',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/account/${provider}/${owner}`,
      isExternalLink: false,
    },
    pullIndirectChanges: {
      text: 'Indirect changes',
      path: (
        { provider = p, owner = o, repo = r, pullId = pi } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
        }
      ) => `/${provider}/${owner}/${repo}/pull/${pullId}/indirect-changes`,
      isExternalLink: false,
    },
    pullCommits: {
      text: 'Commits',
      path: (
        { provider = p, owner = o, repo = r, pullId = pi } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
        }
      ) => `/${provider}/${owner}/${repo}/pull/${pullId}/commits`,
      isExternalLink: false,
    },
    pullFlags: {
      text: 'Flags',
      path: (
        { provider = p, owner = o, repo = r, pullId = pi } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
        }
      ) => `/${provider}/${owner}/${repo}/pull/${pullId}/flags`,
      isExternalLink: false,
    },
    githubRepoSecrets: {
      text: 'GitHub Repo',
      path: (
        { owner = o, repo = r } = {
          owner: o,
          repo: r,
        }
      ) => `https://github.com/${owner}/${repo}/settings/secrets/actions`,
      isExternalLink: true,
      openNewTab: true,
    },
    githubRepoActions: {
      text: 'GitHub Repo',
      path: (
        { owner = o, repo = r } = {
          owner: o,
          repo: r,
        }
      ) => `https://github.com/${owner}/${repo}/settings/actions`,
      isExternalLink: true,
      openNewTab: true,
    },
  }
}

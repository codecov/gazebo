import qs from 'qs'
import { useParams } from 'react-router-dom'

import config from 'config'

// Note to Terry, when we have more time automate all paths to pass through query search params.

export function useNavLinks() {
  const {
    provider: p,
    owner: o,
    repo: r,
    id: i,
    pullId: pi,
    commit: c,
    path: pa,
  } = useParams()

  return {
    signOut: {
      text: 'Sign Out',
      path: ({ provider = p } = { provider: p }) => {
        return `${config.API_URL}/logout/${provider}`
      },
      isExternalLink: true,
    },
    signIn: {
      text: 'Log in',
      path: ({ provider = p, to } = { provider: p }) => {
        const query = qs.stringify({ to }, { addQueryPrefix: true })
        return `${config.API_URL}/login/${provider}${query}`
      },
      isExternalLink: true,
    },
    signUp: {
      text: 'Sign Up',
      path: () => `${config.MARKETING_BASE_URL}/sign-up/`,
      isExternalLink: true,
    },
    oktaLogin: {
      text: 'Authenticate with Okta',
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) => {
        return `${config.API_URL}/login/okta/${provider}/${owner}`
      },
      isExternalLink: true,
    },
    owner: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) => {
        if (provider && owner) {
          return `/${provider}/${owner}`
        }
        return '/'
      },
      isExternalLink: false,
    },
    analytics: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/analytics/${provider}/${owner}`,
      isExternalLink: false,
    },
    codecovAI: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/codecovai/${provider}/${owner}`,
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
      path: (
        { provider = p, owner = o, params = null } = { provider: p, owner: o }
      ) => {
        if (params !== null) {
          const queryString = qs.stringify(params, {
            addQueryPrefix: true,
          })

          return `/plan/${provider}/${owner}/upgrade${queryString}`
        }

        return `/plan/${provider}/${owner}/upgrade`
      },
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
    downgradePlanPage: {
      path: ({ provider = p, owner = o } = { provider: p, owner: o }) =>
        `/plan/${provider}/${owner}/cancel/downgrade`,
      isExternalLink: false,
      text: 'Downgrade to basic',
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
        { provider = p, owner = o, repo = r, commit, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          commit: c,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}/commit/${commit}${query}`
      },
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
        { provider = p, owner = o, repo = r, tree, ref, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        if (ref) {
          const encodedRef = encodeURIComponent(ref)

          if (tree) {
            const encodedTree = encodeURIComponent(tree)
            return `/${provider}/${owner}/${repo}/tree/${encodedRef}/${encodedTree}${query}`
          }

          return `/${provider}/${owner}/${repo}/tree/${encodedRef}/${query}`
        }

        return `/${provider}/${owner}/${repo}/tree/${query}`
      },
      isExternalLink: false,
      text: 'Tree View',
    },
    fileViewer: {
      path: (
        { provider = p, owner = o, repo = r, ref, tree, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          queryParams: {},
        }
      ) => {
        const encodedRef = encodeURIComponent(ref)
        const encodedTree = encodeURIComponent(tree)

        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}/blob/${encodedRef}/${encodedTree}${query}`
      },
      isExternalLink: false,
      text: 'File Viewer',
    },
    commitTreeView: {
      path: (
        {
          provider = p,
          owner = o,
          repo = r,
          tree,
          commit,
          queryParams = {},
        } = {
          provider: p,
          owner: o,
          repo: r,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        if (tree) {
          return `/${provider}/${owner}/${repo}/commit/${commit}/tree/${tree}${query}`
        }
        return `/${provider}/${owner}/${repo}/commit/${commit}/tree${query}`
      },
      isExternalLink: false,
      text: 'Commit Tree View',
    },
    commitFileDiff: {
      path: (
        {
          provider = p,
          owner = o,
          repo = r,
          tree,
          commit,
          queryParams = {},
        } = {
          provider: p,
          owner: o,
          repo: r,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}/commit/${commit}/blob/${tree}${query}`
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
    circleCI: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/new/circle-ci`,
      text: 'CircleCI',
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
    coverage: {
      path: (
        { provider = p, owner = o, repo = r, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}${query}`
      },
      text: 'Overview',
      isExternalLink: false,
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
    componentsTab: {
      path: (
        { provider = p, owner = o, repo = r, branch = undefined } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        if (branch) {
          return `/${provider}/${owner}/${repo}/components?branch=${branch}`
        }
        return `/${provider}/${owner}/${repo}/components`
      },
      isExternalLink: false,
      text: 'Components',
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
        { provider = p, owner = o, repo = r, pullId = pi, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}/pull/${pullId}${query}`
      },
      text: 'Files changed',
    },
    configuration: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/config`,
      text: 'Configuration',
    },
    configGeneral: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/config/general`,
      text: 'General',
    },
    configYaml: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/config/yaml`,
      text: 'Yaml',
    },
    configBadge: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,

          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/config/badge`,
      text: 'Badges & Graphs',
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
        `/account/${provider}/${owner}/org-upload-token`,
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
        { provider = p, owner = o, repo = r, pullId = pi, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }
        return `/${provider}/${owner}/${repo}/pull/${pullId}/indirect-changes${query}`
      },
      isExternalLink: false,
    },
    commitIndirectChanges: {
      text: 'Indirect changes',
      path: (
        { provider = p, owner = o, repo = r, commit, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (queryParams && Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}/commit/${commit}/indirect-changes${query}`
      },
      isExternalLink: false,
    },
    pullCommits: {
      text: 'Commits',
      path: (
        { provider = p, owner = o, repo = r, pullId = pi, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }
        return `/${provider}/${owner}/${repo}/pull/${pullId}/commits${query}`
      },
      isExternalLink: false,
    },
    pullFlags: {
      text: 'Flags',
      path: (
        { provider = p, owner = o, repo = r, pullId = pi, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }
        return `/${provider}/${owner}/${repo}/pull/${pullId}/flags${query}`
      },
      isExternalLink: false,
    },
    pullComponents: {
      text: 'Components',
      path: (
        { provider = p, owner = o, repo = r, pullId = pi, queryParams = {} } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }
        return `/${provider}/${owner}/${repo}/pull/${pullId}/components${query}`
      },
      isExternalLink: false,
    },
    // Tree vs blogs gets strange, for some reason the code relies on a route param path not tree despite the path label. Could likely use a refactor.
    pullTreeView: {
      text: 'Pull tree view',
      path: (
        {
          provider = p,
          owner = o,
          repo = r,
          pullId = pi,
          tree,
          queryParams = {},
        } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          queryParams: {},
        }
      ) => {
        // TODO: doesn't default to tree in the url, this diverges from the rest of the links how ever the breadcrumbs rely on it. We should make an alternative solution for the breadcrumb / to support converting to typescript.
        let query = ''
        if (Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        if (tree) {
          return `/${provider}/${owner}/${repo}/pull/${pullId}/tree/${tree}${query}`
        }
        return `/${provider}/${owner}/${repo}/pull/${pullId}/tree${query}`
      },
      isExternalLink: false,
    },
    pullFileView: {
      path: (
        {
          provider = p,
          owner = o,
          repo = r,
          tree = pa,
          pullId = pi,
          queryParams = {},
        } = {
          provider: p,
          owner: o,
          repo: r,
          pullId: pi,
          tree: pa,
          queryParams: {},
        }
      ) => {
        let query = ''
        if (Object.keys(queryParams).length > 0) {
          query = qs.stringify(queryParams, { addQueryPrefix: true })
        }

        return `/${provider}/${owner}/${repo}/pull/${pullId}/blob/${tree}${query}`
      },
      isExternalLink: false,
      text: 'Pull File View',
    },
    githubRepoSecrets: {
      text: 'GitHub Repo',
      path: (
        { owner = o, repo = r } = {
          owner: o,
          repo: r,
        }
      ) => `https://github.com/${owner}/${repo}/settings/secrets/actions/new`,
      isExternalLink: true,
      openNewTab: true,
    },
    githubRepoActions: {
      text: 'GitHub Actions workflow yaml file',
      path: (
        { owner = o, repo = r, branch } = {
          owner: o,
          repo: r,
        }
      ) =>
        `https://github.com/${owner}/${repo}/tree/${branch}/.github/workflows`,
      isExternalLink: true,
      openNewTab: true,
    },
    circleCIEnvVars: {
      text: 'environment variables',
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) =>
        `https://app.circleci.com/settings/project/${provider}/${owner}/${repo}/environment-variables`,
      isExternalLink: true,
      openNewTab: true,
    },
    circleCIyaml: {
      text: 'config.yml',
      path: (
        { owner = o, repo = r, branch } = {
          owner: o,
          repo: r,
        }
      ) =>
        `https://github.com/${owner}/${repo}/tree/${branch}/.circleci/config`,
      isExternalLink: true,
      openNewTab: true,
    },
    bundles: {
      path: (
        {
          provider = p,
          owner = o,
          repo = r,
          branch = undefined,
          bundle = undefined,
        } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        if (branch && bundle) {
          return `/${provider}/${owner}/${repo}/bundles/${branch}/${bundle}`
        }

        if (branch) {
          return `/${provider}/${owner}/${repo}/bundles/${branch}`
        }

        return `/${provider}/${owner}/${repo}/bundles`
      },
      text: 'Bundles',
    },
    bundleOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new`,
      text: 'Vite',
    },
    bundleRollupOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new/rollup`,
      text: 'Rollup',
    },
    bundleWebpackOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new/webpack`,
      text: 'Webpack',
    },
    bundleRemixOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new/remix-vite`,
      text: 'Remix (Vite)',
    },
    bundleNuxtOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new/nuxt`,
      text: 'Nuxt',
    },
    bundleSvelteKitOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new/sveltekit`,
      text: 'SvelteKit',
    },
    bundleSolidStartOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => `/${provider}/${owner}/${repo}/bundles/new/solidstart`,
      text: 'SolidStart',
    },
    failedTests: {
      path: (
        { provider = p, owner = o, repo = r, branch = undefined } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        if (branch) {
          return `/${provider}/${owner}/${repo}/tests/${branch}`
        }

        return `/${provider}/${owner}/${repo}/tests`
      },
      text: 'Failed Tests',
    },
    failedTestsOnboarding: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        return `/${provider}/${owner}/${repo}/tests/new`
      },
      isExternalLink: false,
      text: 'Tests',
    },
    failedTestsCodecovCLI: {
      path: (
        { provider = p, owner = o, repo = r } = {
          provider: p,
          owner: o,
          repo: r,
        }
      ) => {
        return `/${provider}/${owner}/${repo}/tests/new/codecov-cli`
      },
      text: 'Codecov CLI',
      isExternalLink: false,
    },
    oktaAccess: {
      path: (
        { provider = p, owner = o } = {
          provider: p,
          owner: o,
        }
      ) => {
        return `/account/${provider}/${owner}/okta-access`
      },
      text: 'Okta access',
      isExternalLink: false,
    },
  }
}

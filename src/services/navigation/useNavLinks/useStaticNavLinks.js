import config from 'config'

// Links that aren't tied to the route or runtime variables.
export function useStaticNavLinks() {
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
      path: () => `${config.MARKETING_BASE_URL}/terms-and-conditions`,
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
    oauthEnabling: {
      text: 'Approval for third party access',
      path: () =>
        'https://docs.github.com/en/organizations/restricting-access-to-your-organizations-data/enabling-oauth-app-access-restrictions-for-your-organization',
      isExternalLink: true,
      openNewTab: true,
    },
    codecovAppInstallation: {
      text: 'Install Codecov app for an org',
      path: () => 'https://github.com/apps/codecov/installations/new',
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
    deployingFlagsSupport: {
      text: 'Enabling Flags on Self Hosted',
      path: () =>
        'https://docs.codecov.com/docs/implementing-flags-with-timescaledb',
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
    support: {
      text: 'Support',
      path: () => 'https://codecovpro.zendesk.com/hc/en-us',
      isExternalLink: true,
      openNewTab: true,
    },
    blog: {
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
    codecovGithubApp: {
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
    components: {
      text: 'Components',
      path: () => 'https://docs.codecov.com/docs/components',
      isExternalLink: true,
      openNewTab: true,
    },
    runtimeInsights: {
      text: 'Runtime Insights',
      path: () => 'https://docs.codecov.com/docs/runtime-insights',
      isExternalLink: true,
      openNewTab: true,
    },
    unexpectedChanges: {
      text: 'Unexpected Changes',
      path: () => 'https://docs.codecov.com/docs/unexpected-coverage-changes',
      isExternalLink: true,
      openNewTab: true,
    },
    graphAuthorization: {
      text: 'Graph Authorization',
      path: () =>
        'https://docs.codecov.com/reference/authorization#about-graphs',
      isExternalLink: true,
      openNewTab: true,
    },
    graphsSunburst: {
      text: 'Graphs Sunburst',
      path: () => 'https://docs.codecov.com/docs/graphs#sunburst',
      isExternalLink: true,
      openNewTab: true,
    },
    codecovYaml: {
      text: 'Repository Yaml',
      path: () => 'https://docs.codecov.com/docs/codecov-yaml',
      isExternalLink: true,
      openNewTab: true,
    },
    repoYaml: {
      text: 'Repository Yaml',
      path: () => 'https://docs.codecov.com/docs/codecov-yaml#repository-yaml',
      isExternalLink: true,
      openNewTab: true,
    },
    ciProviderWorkflow: {
      text: 'CI provider workflow',
      path: () => 'https://circleci.com/blog/what-is-continuous-integration',
      isExternalLink: true,
      openNewTab: true,
    },
    exampleRepos: {
      text: 'Codecov uploader and supported languages',
      path: () => 'https://docs.codecov.com/docs/supported-languages',
      isExternalLink: true,
      openNewTab: true,
    },
    prCommentLayout: {
      text: 'Pull request comment layout',
      path: () => 'https://docs.codecov.com/docs/pull-request-comments#layout',
      isExternalLink: true,
      openNewTab: true,
    },
    repoConfigFeedback: {
      text: 'New repo set up feedback',
      path: () => 'https://github.com/codecov/Codecov-user-feedback/issues/18',
      isExternalLink: true,
      openNewTab: true,
    },
    missingComparisonCommit: {
      text: 'comparison commit troubleshooting',
      path: () =>
        'https://docs.codecov.com/docs/error-reference#section-missing-head-commit',
      isExternalLink: true,
      openNewTab: true,
    },
    missingComparisonReport: {
      text: 'comparison report troubleshooting',
      path: () =>
        'https://docs.codecov.com/docs/error-reference#missing-base-report',
      isExternalLink: true,
      openNewTab: true,
    },
    flagsFeedback: {
      text: 'New repo set up feedback',
      path: () => 'https://github.com/codecov/Codecov-user-feedback/issues/27',
      isExternalLink: true,
      openNewTab: true,
    },
    orgUploadTokenDoc: {
      text: 'Organization Upload Token',
      path: () =>
        'https://docs.codecov.com/docs/codecov-uploader#organization-upload-token',
      isExternalLink: true,
      openNewTab: true,
    },
    selfHostedLicensing: {
      text: 'Licensing',
      path: () =>
        'https://docs.codecov.com/docs/self-hosted-dependency-licensing',
      isExternalLink: true,
      openNewTab: true,
    },
    staticAnalysisDoc: {
      text: 'Static Analysis',
      path: () => 'https://docs.codecov.com/docs/automated-test-selection',
      isExternalLink: true,
      openNewTab: true,
    },
    circleCIOrbs: {
      text: 'CircleCI Documentation',
      path: () => 'https://circleci.com/developer/orbs/orb/codecov/codecov',
      isExternalLink: true,
      openNewTab: true,
    },
    freeTrialFaqs: {
      text: 'Free Trial FAQ',
      path: () => 'https://docs.codecov.com/docs/free-trial-faqs',
      isExternalLink: true,
      openNewTab: true,
    },
    feedback: {
      text: 'Feedback',
      path: () => 'https://github.com/codecov/feedback/discussions',
      isExternalLink: true,
      openNewTab: true,
    },
  }
}

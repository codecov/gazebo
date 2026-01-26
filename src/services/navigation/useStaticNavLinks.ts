import config from 'config'

import { DEMO_REPO } from 'shared/utils/demo'

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
      text: 'Free Trial',
      path: () => `${config.MARKETING_BASE_URL}/codecov-free-trial`,
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
    termsOfService: {
      text: 'Terms of Service',
      path: () => `${config.MARKETING_BASE_URL}/terms-of-service`,
      isExternalLink: true,
      openNewTab: true,
    },
    blog: {
      text: 'Blog',
      path: () => `${config.MARKETING_BASE_URL}/blog`,
      isExternalLink: true,
      openNewTab: true,
    },
    sales: {
      text: 'Sales Contact',
      path: () => `${config.MARKETING_BASE_URL}/sales`,
      isExternalLink: true,
      openNewTab: true,
    },
    enterprise: {
      text: 'Self Hosted',
      path: () => `${config.MARKETING_BASE_URL}/self-hosted`,
      isExternalLink: true,
      openNewTab: true,
    },
    teamPlanAbout: {
      text: 'Team plan',
      path: () => `${config.MARKETING_BASE_URL}/team-plan-compare`,
      isExternalLink: true,
      openNewTab: true,
    },
    whyTestCode: {
      text: 'What is Code Coverage',
      path: () => `${config.MARKETING_BASE_URL}/resource/what-is-code-coverage`,
      isExternalLink: true,
      openNewTab: true,
    },
    docs: {
      text: 'Docs',
      path: () => 'https://docs.codecov.io/',
      isExternalLink: true,
      openNewTab: true,
    },
    aboutCodeCoverage: {
      text: 'About Code Coverage',
      path: () => 'https://docs.codecov.com/docs/about-code-coverage',
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
      path: () => `https://github.com/apps/${config.GH_APP}/installations/new`,
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
    deployingComponentsSupport: {
      text: 'Enabling Components on Self Hosted',
      path: () => 'https://docs.codecov.com/docs/components',
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
    enterpriseSupport: {
      text: 'Enterprise Support',
      path: () => 'https://codecoventerprise.zendesk.com/hc/en-us',
      isExternalLink: true,
      openNewTab: true,
    },
    legacyUI: {
      path: ({ pathname }: { pathname: string }) => config.BASE_URL + pathname,
      isExternalLink: true,
      text: 'Legacy User Interface',
      openNewTab: true,
    },
    uploader: {
      path: () => 'https://docs.codecov.com/docs/codecov-uploader',
      isExternalLink: true,
      text: 'Codecov Uploader',
      openNewTab: true,
    },
    uploaderCLI: {
      path: () =>
        'https://docs.codecov.com/docs/codecov-uploader#using-the-cli-to-upload-reports-with-codecovio-cloud',
      isExternalLink: true,
      text: 'Uploader CLI',
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
      path: () => `https://github.com/apps/${config.GH_APP}`,
      isExternalLink: true,
      text: 'Codecov GitHub App',
      openNewTab: true,
    },
    codecovGithubAppSelectTarget: {
      path: () =>
        `https://github.com/apps/${config.GH_APP}/installations/select_target`,
      isExternalLink: true,
      text: 'Codecov GitHub App',
      openNewTab: true,
    },
    githubRateLimitExceeded: {
      path: () =>
        'https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api',
      isExternalLink: true,
      text: 'GitHub documentation',
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
    statusBadges: {
      text: 'Status Badges',
      path: () => 'https://docs.codecov.com/docs/status-badges',
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
    statusChecks: {
      text: 'Status Checks',
      path: () => 'https://docs.codecov.com/docs/commit-status',
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
    dedicatedEnterpriseCloudGuide: {
      text: 'Dedicated Enterprise Cloud Guide',
      path: () =>
        'https://docs.codecov.com/docs/codecov-dedicated-enterprise-cloud-install-steps',
      isExternalLink: true,
      openNewTab: true,
    },
    generateSelfHostedLicense: {
      text: 'Self Hosted License Generation',
      path: () =>
        'https://github.com/codecov/self-hosted/tree/main#license-generation',
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
    bundleAnalysisDocs: {
      text: 'Bundle analysis set up documentation',
      path: () => 'https://docs.codecov.com/docs/javascript-bundle-analysis',
      isExternalLink: true,
      openNewTab: true,
    },
    bundleConfigFeedback: {
      text: 'New bundle analysis set up feedback',
      path: () => 'https://github.com/codecov/feedback/issues/270',
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
    componentsFeedback: {
      text: 'Components analytics set up feedback',
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
    nextJSCustomConfig: {
      text: 'Next.js Custom Config',
      path: () =>
        'https://nextjs.org/docs/app/api-reference/next-config-js/webpack',
      isExternalLink: true,
      openNewTab: true,
    },
    quickStart: {
      text: 'Quick Start',
      path: () => 'https://docs.codecov.com/docs/quick-start',
      isExternalLink: true,
      openNewTab: true,
    },
    codecovExampleJSCircleCIWorkflow: {
      text: 'GitHub Codecov Example CircleCI JS workflow',
      path: () =>
        'https://github.com/codecov/example-javascript/blob/main/.circleci/config.yml',
      isExternalLink: true,
      openNewTab: true,
    },
    codecovExampleJSCircleCIWorkflowSteps: {
      text: 'GitHub Codecov Example CircleCI JS workflow',
      path: () =>
        'https://app.circleci.com/pipelines/github/codecov/example-javascript/148/workflows/180ae354-0d8c-4205-8815-f4c516a042a4/jobs/130/steps',
      isExternalLink: true,
      openNewTab: true,
    },
    codecovYamlValidator: {
      text: 'VSCode Yaml Validator Extension',
      path: () =>
        `https://marketplace.visualstudio.com/items?itemName=Codecov.codecov#:~:text=Codecov's%20official%20validator%20extension%20for,and%20configuration%20of%20new%20repositories.&text=Launch%20VS%20Code%20Quick%20Open,following%20command%2C%20and%20press%20enter.&text=Create%2C%20manage%2C%20and%20validate%20the,Code%20with%20our%20latest%20extension.`,
      isExternalLink: true,
      openNewTab: true,
    },
    codecovBrowserExtension: {
      text: 'Codecov Browser Extension',
      path: () => 'https://docs.codecov.com/docs/the-codecov-browser-extension',
      isExternalLink: true,
      openNewTab: true,
    },
    codecovSlackApp: {
      text: 'Codecov Slack App',
      path: () => 'https://notifications.codecov.io/slack/install',
      isExternalLink: true,
      openNewTab: true,
    },
    installSelfHosted: {
      text: 'Codecov Self-Hosted Installation Guide',
      path: () =>
        'https://docs.codecov.com/docs/installing-codecov-self-hosted',
      isExternalLink: true,
      openNewTab: true,
    },
    testsAnalytics: {
      text: 'Tests Analytics',
      path: () =>
        'https://docs.codecov.com/docs/test-analytics#failed-test-reporting',
      isExternalLink: true,
      openNewTab: true,
    },
    testsAnalyticsDataRetention: {
      text: 'Test Analytics Data Retention',
      path: () => 'https://docs.codecov.com/docs/test-analytics#data-retention',
      isExternalLink: true,
      openNewTab: true,
    },
    expiredReports: {
      text: 'Expired Reports',
      path: () =>
        'https://docs.codecov.com/docs/codecov-yaml#section-expired-reports',
      isExternalLink: true,
      openNewTab: true,
    },
    unusableReports: {
      text: 'Unusable Reports',
      path: () =>
        'https://docs.codecov.com/docs/error-reference#unusable-reports',
      isExternalLink: true,
      openNewTab: true,
    },
    demoRepo: {
      text: DEMO_REPO.displayName,
      path: () => `/${DEMO_REPO.provider}/${DEMO_REPO.owner}/${DEMO_REPO.repo}`,
      isExternalLink: true,
      openNewTab: true,
    },
    teamPlanFeedbackSurvey: {
      path: () =>
        `https://docs.google.com/forms/d/e/1FAIpQLSeoMHPyECewV7X3UaT-uUxZCmYy1T6hEX_aecCD2ppPHGSvUw/viewform`,
      text: 'Team plan feedback survey',
      isExternalLink: true,
    },
    proPlanFeedbackSurvey: {
      path: () => `https://forms.gle/nf37sRAtyQeXVTdr8`,
      text: 'Pro plan feedback survey',
      isExternalLink: true,
    },
    bundleFeedbackSurvey: {
      path: () => `https://forms.gle/8fzZrwWEaBRz4ufD9`,
      text: 'Bundle analysis feedback survey',
      isExternalLink: true,
    },
    tokenlessDocs: {
      text: 'Tokenless Uploads',
      path: () =>
        'https://docs.codecov.com/docs/codecov-tokens#uploading-without-a-token',
      isExternalLink: true,
      openNewTab: true,
    },
    requireCIPassDocs: {
      text: 'Codecov YAML require CI to pass',
      path: () =>
        'https://docs.codecov.com/docs/codecovyml-reference#codecovrequire_ci_to_pass',
      isExternalLink: true,
      openNewTab: true,
    },
    yamlValidatorDocs: {
      text: 'YAML validator',
      path: () =>
        'https://docs.codecov.com/docs/codecov-yaml#validate-your-repository-yaml',
      isExternalLink: true,
      openNewTab: true,
    },
    circleCIEnvVars: {
      text: 'environment variables',
      path: () =>
        'https://circleci.com/docs/set-environment-variable/#set-an-environment-variable-in-a-project',
      isExternalLink: true,
      openNewTab: true,
    },
    testAnalyticsTroubleshooting: {
      text: 'Test Analytics Troubleshooting',
      path: () =>
        'https://docs.codecov.com/docs/test-analytics#troubleshooting',
      isExternalLink: true,
      openNewTab: true,
    },
    pathFixing: {
      text: 'Path Fixing',
      path: () => 'https://docs.codecov.com/docs/fixing-paths',
      isExternalLink: true,
      openNewTab: true,
    },
  }
}

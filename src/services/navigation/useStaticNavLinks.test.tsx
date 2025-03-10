import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useStaticNavLinks } from './useStaticNavLinks'

vi.mock('config')

describe('useStaticNavLinks', () => {
  const view = renderHook(() => useStaticNavLinks(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/gh']} initialIndex={0}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    ),
  })
  describe('cloud', () => {
    beforeAll(async () => {
      await vi.importActual('config')
    })

    afterAll(() => {
      vi.mock('config')
    })

    const links = view.result.current

    describe.each`
      link                                   | outcome
      ${links.root}                          | ${`${config.MARKETING_BASE_URL}`}
      ${links.terms}                         | ${`${config.MARKETING_BASE_URL}/terms-and-conditions`}
      ${links.privacy}                       | ${`${config.MARKETING_BASE_URL}/privacy`}
      ${links.security}                      | ${`${config.MARKETING_BASE_URL}/security`}
      ${links.gdpr}                          | ${`${config.MARKETING_BASE_URL}/gdpr`}
      ${links.pricing}                       | ${`${config.MARKETING_BASE_URL}/pricing`}
      ${links.enterprise}                    | ${`${config.MARKETING_BASE_URL}/self-hosted`}
      ${links.freeTrial}                     | ${`${config.MARKETING_BASE_URL}/codecov-free-trial`}
      ${links.whyTestCode}                   | ${`${config.MARKETING_BASE_URL}/resource/what-is-code-coverage`}
      ${links.demo}                          | ${`${config.MARKETING_BASE_URL}/demo`}
      ${links.blog}                          | ${`${config.MARKETING_BASE_URL}/blog`}
      ${links.sales}                         | ${`${config.MARKETING_BASE_URL}/sales`}
      ${links.termsOfService}                | ${`${config.MARKETING_BASE_URL}/terms-of-service`}
      ${links.githubMarketplace}             | ${`https://github.com/marketplace/codecov`}
      ${links.support}                       | ${`https://codecovpro.zendesk.com/hc/en-us`}
      ${links.enterpriseSupport}             | ${`https://codecoventerprise.zendesk.com/hc/en-us`}
      ${links.docs}                          | ${`https://docs.codecov.io/`}
      ${links.oauthTroubleshoot}             | ${'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting'}
      ${links.teamPlanAbout}                 | ${'https://about.codecov.io/team-plan-compare'}
      ${links.flags}                         | ${'https://docs.codecov.com/docs/flags'}
      ${links.components}                    | ${'https://docs.codecov.com/docs/components'}
      ${links.unexpectedChanges}             | ${'https://docs.codecov.com/docs/unexpected-coverage-changes'}
      ${links.userAppManagePage}             | ${'https://github.com/settings/connections/applications/c68c81cbfd179a50784a'}
      ${links.codecovAppInstallation}        | ${`https://github.com/apps/${config.GH_APP}/installations/new`}
      ${links.deployingFlagsSupport}         | ${'https://docs.codecov.com/docs/implementing-flags-with-timescaledb'}
      ${links.deployingComponentsSupport}    | ${'https://docs.codecov.com/docs/components'}
      ${links.dedicatedEnterpriseCloudGuide} | ${`https://docs.codecov.com/docs/codecov-dedicated-enterprise-cloud-install-steps`}
      ${links.generateSelfHostedLicense}     | ${`https://github.com/codecov/self-hosted/tree/main#license-generation`}
      ${links.uploader}                      | ${'https://docs.codecov.com/docs/codecov-uploader'}
      ${links.uploaderCLI}                   | ${'https://docs.codecov.com/docs/codecov-uploader#using-the-cli-to-upload-reports-with-codecovio-cloud'}
      ${links.integrityCheck}                | ${'https://docs.codecov.com/docs/codecov-uploader#integrity-checking-the-uploader'}
      ${links.codecovGithubApp}              | ${`https://github.com/apps/${config.GH_APP}`}
      ${links.codecovGithubAppSelectTarget}  | ${`https://github.com/apps/${config.GH_APP}/installations/select_target`}
      ${links.teamBot}                       | ${'https://docs.codecov.com/docs/team-bot'}
      ${links.runtimeInsights}               | ${'https://docs.codecov.com/docs/runtime-insights'}
      ${links.graphAuthorization}            | ${'https://docs.codecov.com/reference/authorization#about-graphs'}
      ${links.statusBadges}                  | ${'https://docs.codecov.com/docs/status-badges'}
      ${links.graphsSunburst}                | ${'https://docs.codecov.com/docs/graphs#sunburst'}
      ${links.ciProviderWorkflow}            | ${'https://circleci.com/blog/what-is-continuous-integration'}
      ${links.exampleRepos}                  | ${'https://docs.codecov.com/docs/supported-languages'}
      ${links.prCommentLayout}               | ${'https://docs.codecov.com/docs/pull-request-comments#layout'}
      ${links.flagsFeedback}                 | ${'https://github.com/codecov/Codecov-user-feedback/issues/27'}
      ${links.missingComparisonCommit}       | ${'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'}
      ${links.missingComparisonReport}       | ${'https://docs.codecov.com/docs/error-reference#missing-base-report'}
      ${links.flagsFeedback}                 | ${'https://github.com/codecov/Codecov-user-feedback/issues/27'}
      ${links.orgUploadTokenDoc}             | ${'https://docs.codecov.com/docs/codecov-uploader#organization-upload-token'}
      ${links.selfHostedLicensing}           | ${'https://docs.codecov.com/docs/self-hosted-dependency-licensing'}
      ${links.repoYaml}                      | ${'https://docs.codecov.com/docs/codecov-yaml#repository-yaml'}
      ${links.codecovYaml}                   | ${'https://docs.codecov.com/docs/codecov-yaml'}
      ${links.oauthEnabling}                 | ${'https://docs.github.com/en/organizations/restricting-access-to-your-organizations-data/enabling-oauth-app-access-restrictions-for-your-organization'}
      ${links.github}                        | ${'https://github.com/marketplace/codecov'}
      ${links.repoConfigFeedback}            | ${'https://github.com/codecov/Codecov-user-feedback/issues/18'}
      ${links.staticAnalysisDoc}             | ${'https://docs.codecov.com/docs/automated-test-selection'}
      ${links.circleCIOrbs}                  | ${'https://circleci.com/developer/orbs/orb/codecov/codecov'}
      ${links.freeTrialFaqs}                 | ${'https://docs.codecov.com/docs/free-trial-faqs'}
      ${links.feedback}                      | ${'https://github.com/codecov/feedback/discussions'}
      ${links.nextJSCustomConfig}            | ${'https://nextjs.org/docs/app/api-reference/next-config-js/webpack'}
      ${links.bundleConfigFeedback}          | ${'https://github.com/codecov/feedback/issues/270'}
      ${links.quickStart}                    | ${'https://docs.codecov.com/docs/quick-start'}
      ${links.installSelfHosted}             | ${'https://docs.codecov.com/docs/installing-codecov-self-hosted'}
      ${links.testsAnalytics}                | ${'https://docs.codecov.com/docs/test-analytics#failed-test-reporting'}
      ${links.testsAnalyticsDataRetention}   | ${'https://docs.codecov.com/docs/test-analytics#data-retention'}
      ${links.expiredReports}                | ${'https://docs.codecov.com/docs/codecov-yaml#section-expired-reports'}
      ${links.unusableReports}               | ${'https://docs.codecov.com/docs/error-reference#unusable-reports'}
      ${links.demoRepo}                      | ${'/github/codecov/gazebo'}
      ${links.teamPlanFeedbackSurvey}        | ${'https://docs.google.com/forms/d/e/1FAIpQLSeoMHPyECewV7X3UaT-uUxZCmYy1T6hEX_aecCD2ppPHGSvUw/viewform'}
      ${links.proPlanFeedbackSurvey}         | ${'https://forms.gle/nf37sRAtyQeXVTdr8'}
      ${links.bundleFeedbackSurvey}          | ${'https://forms.gle/8fzZrwWEaBRz4ufD9'}
      ${links.tokenlessDocs}                 | ${'https://docs.codecov.com/docs/codecov-tokens#uploading-without-a-token'}
      ${links.requireCIPassDocs}             | ${'https://docs.codecov.com/docs/codecovyml-reference#codecovrequire_ci_to_pass'}
      ${links.circleCIEnvVars}               | ${'https://circleci.com/docs/set-environment-variable/#set-an-environment-variable-in-a-project'}
      ${links.testAnalyticsTroubleshooting}  | ${'https://docs.codecov.com/docs/test-analytics#troubleshooting'}
    `('static links return path', ({ link, outcome }) => {
      it(`${link.text}: Returns the correct link`, () => {
        expect(link.path()).toBe(outcome)
      })
    })
    describe('legacyUI', () => {
      it('returns the correct url', () => {
        expect(links.legacyUI.path({ pathname: 'random/path/name' })).toBe(
          config.BASE_URL + 'random/path/name'
        )
      })
    })
  })
})

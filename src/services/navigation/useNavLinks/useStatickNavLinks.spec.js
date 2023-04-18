import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useStaticNavLinks } from './useStaticNavLinks'

jest.mock('config')

describe('useStaticNavLinks', () => {
  const view = renderHook(() => useStaticNavLinks(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/gh']} initialIndex={0}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    ),
  })
  describe('cloud', () => {
    beforeAll(() => jest.requireActual('config'))
    afterAll(() => jest.mock('config'))
    const links = view.result.current

    describe.each`
      link                             | outcome
      ${links.root}                    | ${`${config.MARKETING_BASE_URL}`}
      ${links.terms}                   | ${`${config.MARKETING_BASE_URL}/terms-and-conditions`}
      ${links.privacy}                 | ${`${config.MARKETING_BASE_URL}/privacy`}
      ${links.security}                | ${`${config.MARKETING_BASE_URL}/security`}
      ${links.gdpr}                    | ${`${config.MARKETING_BASE_URL}/gdpr`}
      ${links.pricing}                 | ${`${config.MARKETING_BASE_URL}/pricing`}
      ${links.support}                 | ${`https://codecov.freshdesk.com/support/home`}
      ${links.docs}                    | ${`https://docs.codecov.io/`}
      ${links.enterprise}              | ${`${config.MARKETING_BASE_URL}/self-hosted`}
      ${links.githubMarketplace}       | ${`https://github.com/marketplace/codecov`}
      ${links.freeTrial}               | ${`${config.MARKETING_BASE_URL}/trial`}
      ${links.demo}                    | ${`${config.MARKETING_BASE_URL}/demo`}
      ${links.oauthTroubleshoot}       | ${'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting'}
      ${links.flags}                   | ${'https://docs.codecov.com/docs/flags'}
      ${links.unexpectedChanges}       | ${'https://docs.codecov.com/docs/unexpected-coverage-changes'}
      ${links.userAppManagePage}       | ${'https://github.com/settings/connections/applications/c68c81cbfd179a50784a'}
      ${links.deployingFlagsSupport}   | ${'https://docs.codecov.com/docs/implementing-flags-with-timescaledb'}
      ${links.blog}                    | ${`${config.MARKETING_BASE_URL}/blog`}
      ${links.sales}                   | ${`${config.MARKETING_BASE_URL}/sales`}
      ${links.uploader}                | ${'https://docs.codecov.com/docs/codecov-uploader'}
      ${links.integrityCheck}          | ${'https://docs.codecov.com/docs/codecov-uploader#integrity-checking-the-uploader'}
      ${links.codecovGithubApp}        | ${'https://github.com/apps/codecov'}
      ${links.teamBot}                 | ${'https://docs.codecov.com/docs/team-bot'}
      ${links.runtimeInsights}         | ${'https://docs.codecov.com/docs/runtime-insights'}
      ${links.graphAuthorization}      | ${'https://docs.codecov.com/reference/authorization#about-graphs'}
      ${links.graphsSunburst}          | ${'https://docs.codecov.com/reference/sunburst'}
      ${links.ciProviderWorkflow}      | ${'https://circleci.com/blog/what-is-continuous-integration'}
      ${links.exampleRepos}            | ${'https://docs.codecov.com/docs/supported-languages'}
      ${links.prCommentLayout}         | ${'https://docs.codecov.com/docs/pull-request-comments#layout'}
      ${links.flagsFeedback}           | ${'https://github.com/codecov/Codecov-user-feedback/issues/27'}
      ${links.missingComparisonCommit} | ${'https://docs.codecov.com/docs/error-reference#section-missing-head-commit'}
      ${links.missingComparisonReport} | ${'https://docs.codecov.com/docs/error-reference#missing-base-report'}
      ${links.flagsFeedback}           | ${'https://github.com/codecov/Codecov-user-feedback/issues/27'}
      ${links.orgUploadTokenDoc}       | ${'https://docs.codecov.com/docs/codecov-uploader#organization-upload-token'}
      ${links.selfHostedLicensing}     | ${'https://docs.codecov.com/docs/self-hosted-dependency-licensing'}
      ${links.repoYaml}                | ${'https://docs.codecov.com/docs/codecov-yaml#repository-yaml'}
      ${links.oauthEnabling}           | ${'https://docs.github.com/en/organizations/restricting-access-to-your-organizations-data/enabling-oauth-app-access-restrictions-for-your-organization'}
      ${links.github}                  | ${'https://github.com/marketplace/codecov'}
      ${links.repoConfigFeedback}      | ${'https://github.com/codecov/Codecov-user-feedback/issues/18'}
      ${links.staticAnalysisDoc}       | ${'https://docs.codecov.com/docs/automated-test-selection'}
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
  describe('self hosted', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
    })
    afterEach(() => jest.resetAllMocks())

    it('sends users to the correct support link', () => {
      const links = view.result.current

      expect(links.support.path()).toBe(
        `https://codecoventerprise.codecov.io/support/home`
      )
    })
  })
  /*
    Not yet implemented but in the future check the plan and if it's an enterprise
    plan we can switch which link support goes to.
  */
  describe('cloud enterprise support', () => {
    it('sends users to the correct support link', () => {
      const links = view.result.current

      expect(links.support.path({ isEnterprise: true })).toBe(
        `https://codecoventerprise.codecov.io/support/home`
      )
    })
  })
})

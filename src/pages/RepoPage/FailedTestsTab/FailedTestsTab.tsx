import { Suspense } from 'react'
import {
  Redirect,
  Switch,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom'

import { SentryRoute } from 'sentry'

import testsFailedOnboarding from 'assets/svg/onboardingTests/testsFailedOnboarding.svg'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'
import Spinner from 'ui/Spinner'

import CodecovCLI from './CodecovCLI'
import FailedTestsTable from './FailedTestsTable/FailedTestsTable'
import GitHubActions from './GitHubActions'


const SETUP_OPTIONS = {
  GitHubActions: 'GitHubActions',
  CodecovCLI: 'CodecovCLI',
} as const
type SetupOptionsValue = (typeof SETUP_OPTIONS)[keyof typeof SETUP_OPTIONS]

function SetupOptionSelector() {
  const location = useLocation()
  const history = useHistory()
  const {
    failedTestsOnboarding: githubActions,
    failedTestsCodecovCLI: codecovCLI,
  } = useNavLinks()
  const urls = {
    GitHubActions: githubActions.path(),
    CodecovCLI: codecovCLI.path(),
  }

  const getInitialSetupOption = () => {
    if (location.pathname === urls.GitHubActions) {
      return SETUP_OPTIONS.GitHubActions
    }
    if (location.pathname === urls.CodecovCLI) {
      return SETUP_OPTIONS.CodecovCLI
    }
    return SETUP_OPTIONS.GitHubActions
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Select a setup option</Card.Title>
      </Card.Header>
      <Card.Content>
        <RadioTileGroup
          defaultValue={getInitialSetupOption()}
          onValueChange={(value: SetupOptionsValue) => {
            history.replace(urls[value])
          }}
        >
          <RadioTileGroup.Item
            value={SETUP_OPTIONS.GitHubActions}
            data-testid="github-actions-radio"
          >
            <RadioTileGroup.Label>Using GitHub Actions</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              Choose this option, if you have been using GitHub actions to run
              your CI.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={SETUP_OPTIONS.CodecovCLI}
            data-testid="codecov-cli-radio"
          >
            <RadioTileGroup.Label>
              Using Codecov&apos;s CLI
            </RadioTileGroup.Label>
            <RadioTileGroup.Description>
              Choose this option, if you have been using Codecov&apos;s CLI to
              upload coverage reports.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
        </RadioTileGroup>
      </Card.Content>
    </Card>
  )
}

function OnboardingWrapper({ usesCli }: { usesCli: boolean }) {
  return (
    <div className="flex flex-col gap-6 pt-4 lg:w-3/5">
      <img
        src={testsFailedOnboarding.toString()}
        alt="failed-tests-onboarding"
        width="420px"
        className="m-auto"
      />
      <div>
        <h1 className="text-2xl font-semibold">Test Analytics</h1>
        <p className="mt-2 text-ds-gray-octonary">
          Test Analytics offers data on test run times, failure rates, and
          identifies flaky tests to help decrease the risk of deployment
          failures and make it easier to ship new features quickly.
        </p>
      </div>
      <SetupOptionSelector />
      {usesCli ? <CodecovCLI /> : <GitHubActions />}
    </div>
  )
}

const Loader = () => (
  <div className="flex justify-center py-8">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function FailedTestsTab() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoOverview } = useRepoOverview({ provider, owner, repo })

  console.log(repoOverview)

  if (repoOverview?.testAnalyticsEnabled) {
    return (
      <SentryRoute path="/:provider/:owner/:repo/tests" exact>
        <Suspense fallback={<Loader />}>
          <div className="flex flex-1 flex-col gap-4">
            <FailedTestsTable />
          </div>
        </Suspense>
      </SentryRoute>
    )
  }

  return (
    <Switch>
      <Redirect
        exact
        from="/:provider/:owner/:repo/tests"
        to="/:provider/:owner/:repo/tests/new"
      />
      <SentryRoute path="/:provider/:owner/:repo/tests/new" exact>
        <OnboardingWrapper usesCli={false} />
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/tests/new/codecov-cli" exact>
        <OnboardingWrapper usesCli />
      </SentryRoute>
    </Switch>
  )
}

export default FailedTestsTab

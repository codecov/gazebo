import { Switch, useHistory, useLocation } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import testsFailedOnboarding from 'assets/svg/testsFailedOnboarding.svg'
import { useNavLinks } from 'services/navigation'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'

const CI_PROVIDERS = {
  GitHubActions: 'GitHubActions',
  CodecovCLI: 'CodecovCLI',
} as const
type CIProviderValue = (typeof CI_PROVIDERS)[keyof typeof CI_PROVIDERS]

function CISelector() {
  const location = useLocation()
  const history = useHistory()
  const { failedTestsTab: githubActions, failedTestsCodecovCLI: codecovCLI } =
    useNavLinks()
  const urls = {
    GitHubActions: githubActions.path(),
    CodecovCLI: codecovCLI.path(),
  }

  const getInitialProvider = () => {
    if (location.pathname === urls.GitHubActions) {
      return CI_PROVIDERS.GitHubActions
    }
    if (location.pathname === urls.CodecovCLI) {
      return CI_PROVIDERS.CodecovCLI
    }
    return CI_PROVIDERS.GitHubActions
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Select your CI</Card.Title>
      </Card.Header>
      <Card.Content>
        <RadioTileGroup
          defaultValue={getInitialProvider()}
          onValueChange={(value: CIProviderValue) => {
            history.replace(urls[value])
          }}
        >
          <RadioTileGroup.Item
            value={CI_PROVIDERS.GitHubActions}
            data-testid="github-actions-radio"
          >
            <RadioTileGroup.Label>Using GitHub Actions</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              Choose this option, if you have been using GitHub actions to run
              your CI.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={CI_PROVIDERS.CodecovCLI}
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

function Content() {
  return (
    <Switch>
      <SentryRoute path="/:provider/:owner/:repo/tests" exact>
        <>GitHub Actions tab</>
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/tests/codecov-cli" exact>
        <>Codecov CLI tab</>
      </SentryRoute>
    </Switch>
  )
}

export default function FailedTestsTab() {
  return (
    <div className="flex flex-col gap-6 pt-4 lg:w-3/5">
      <img
        src={testsFailedOnboarding.toString()}
        alt="failed-tests"
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
      <CISelector />
      <Content />
    </div>
  )
}

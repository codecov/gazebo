import { lazy, Suspense, useCallback, useMemo } from 'react'
import { Switch, useHistory, useLocation, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useNavLinks } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import { providerToName } from 'shared/utils'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'
import Spinner from 'ui/Spinner'

import ActivationBanner from './ActivationBanner'
import CircleCI from './CircleCI'
import GitHubActions from './GitHubActions'
import IntroBlurb from './IntroBlurb'

const OtherCI = lazy(() => import('./OtherCI'))

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const CI_PROVIDERS = {
  GitHubActions: 'GitHubActions',
  CircleCI: 'CircleCI',
  OtherCI: 'OtherCI',
} as const
type CIProviderValue = (typeof CI_PROVIDERS)[keyof typeof CI_PROVIDERS]

interface CISelectorProps {
  provider: string
  owner: string
  repo: string
}

function CISelector({ provider, owner, repo }: CISelectorProps) {
  const location = useLocation()
  const history = useHistory()
  const { new: githubActions, circleCI, newOtherCI } = useNavLinks()
  const urls = useMemo(
    () => ({
      GitHubActions: githubActions.path({ provider, owner, repo }),
      CircleCI: circleCI.path({ provider, owner, repo }),
      OtherCI: newOtherCI.path({ provider, owner, repo }),
    }),
    [githubActions, circleCI, newOtherCI, provider, owner, repo]
  )

  const getInitialProvider = useCallback(() => {
    const defaultProvider =
      providerToName(provider) !== 'Github'
        ? CI_PROVIDERS.OtherCI
        : CI_PROVIDERS.GitHubActions
    if (location.pathname === urls.CircleCI) {
      return CI_PROVIDERS.CircleCI
    }
    if (location.pathname === urls.OtherCI) {
      return CI_PROVIDERS.OtherCI
    }
    return defaultProvider
  }, [location, urls, provider])

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
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={CI_PROVIDERS.CircleCI}
            data-testid="circle-ci-radio"
          >
            <RadioTileGroup.Label>Using Circle CI</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={CI_PROVIDERS.OtherCI}
            data-testid="other-ci-radio"
          >
            <RadioTileGroup.Label>Other</RadioTileGroup.Label>
          </RadioTileGroup.Item>
        </RadioTileGroup>
      </Card.Content>
    </Card>
  )
}

function Content() {
  return (
    <Switch>
      <SentryRoute path="/:provider/:owner/:repo/new" exact>
        <GitHubActions />
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/new/circle-ci" exact>
        <CircleCI />
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/new/other-ci" exact>
        <Suspense fallback={<Loader />}>
          <OtherCI />
        </Suspense>
      </SentryRoute>
    </Switch>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function NewRepoTab() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const { hardRedirect } = useRedirect({ href: `/${provider}` })

  // if no upload token redirect
  // also have a component render incase redirect isn't fast enough
  if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }

  const renderActivationBanner = !data?.isCurrentUserActivated && data?.repository.private

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 pt-4 lg:w-3/5">
        <IntroBlurb />
        {renderActivationBanner ? <ActivationBanner /> : null}
        <CISelector provider={provider} owner={owner} repo={repo} />
        <Content />
      </div>
    </div>
  )
}

export default NewRepoTab

import { Suspense, useEffect } from 'react'
import { Switch, useHistory, useLocation, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useStoreCodecovEventMetric } from 'services/codecovEventMetrics'
import { useNavLinks } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'
import Spinner from 'ui/Spinner'

import RollupOnboarding from './RollupOnboarding'
import ViteOnboarding from './ViteOnboarding'
import WebpackOnboarding from './WebpackOnboarding'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const BUNDLER_OPTIONS = {
  Vite: 'Vite',
  Rollup: 'Rollup',
  Webpack: 'Webpack',
} as const
type BundlerOption = keyof typeof BUNDLER_OPTIONS
type BundlerOptionUrls = Record<BundlerOption, string>

const getInitialBundler = (path: string, urls: BundlerOptionUrls) => {
  if (path === urls.Vite) {
    return BUNDLER_OPTIONS.Vite
  } else if (path === urls.Rollup) {
    return BUNDLER_OPTIONS.Rollup
  } else if (path === urls.Webpack) {
    return BUNDLER_OPTIONS.Webpack
  }
}

interface BundlerSelectorProps {
  provider: string
  owner: string
  repo: string
}

function BundlerSelector({ provider, owner, repo }: BundlerSelectorProps) {
  const location = useLocation()
  const history = useHistory()
  const { bundleOnboarding, bundleWebpackOnboarding, bundleRollupOnboarding } =
    useNavLinks()
  const urls = {
    Vite: bundleOnboarding.path({ provider, owner, repo }),
    Rollup: bundleRollupOnboarding.path({ provider, owner, repo }),
    Webpack: bundleWebpackOnboarding.path({ provider, owner, repo }),
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Select your bundler</Card.Title>
      </Card.Header>
      <Card.Content>
        <RadioTileGroup
          defaultValue={getInitialBundler(location.pathname, urls)}
          onValueChange={(value: BundlerOption) => {
            history.replace(urls[value])
          }}
        >
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Vite}
            data-testid="vite-radio"
          >
            <RadioTileGroup.Label>Using Vite</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Rollup}
            data-testid="rollup-radio"
          >
            <RadioTileGroup.Label>Using Rollup</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Webpack}
            data-testid="webpack-radio"
          >
            <RadioTileGroup.Label>Using Webpack</RadioTileGroup.Label>
          </RadioTileGroup.Item>
        </RadioTileGroup>
      </Card.Content>
    </Card>
  )
}

const Content: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new" exact>
          <ViteOnboarding />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/rollup">
          <RollupOnboarding />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/webpack">
          <WebpackOnboarding />
        </SentryRoute>
      </Switch>
    </Suspense>
  )
}

const BundleOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const { hardRedirect } = useRedirect({ href: `/${provider}` })
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()

  useEffect(() => {
    storeEventMetric({
      owner,
      event: 'VISITED_PAGE',
      jsonPayload: { page: 'Bundle Onboarding' },
    })
  }, [storeEventMetric, owner])

  // if no upload token redirect
  if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-6 pt-4 lg:w-3/5">
      <div>
        <h1 className="text-lg font-semibold">Bundle Analysis</h1>
        <p className="mt-2 text-ds-gray-octonary">
          Javascript Bundle Analysis helps you improves your application&apos;s
          performance, bandwidth usage, and load times by identifying potential
          performance regressions in your changes.
        </p>
      </div>
      <BundlerSelector provider={provider} owner={owner} repo={repo} />
      <Content />
    </div>
  )
}

export default BundleOnboarding

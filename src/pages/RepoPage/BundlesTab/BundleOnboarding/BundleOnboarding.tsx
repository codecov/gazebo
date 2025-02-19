import { Suspense, useEffect } from 'react'
import { Switch, useHistory, useLocation, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import {
  EVENT_METRICS,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics/useStoreCodecovEventMetric'
import { useNavLinks } from 'services/navigation'
import { useRepo } from 'services/repo'
import { Provider } from 'shared/api/helpers'
import { useRedirect } from 'shared/useRedirect'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'
import Spinner from 'ui/Spinner'

import NuxtOnboarding from './NuxtOnboarding'
import RemixOnboarding from './RemixOnboarding'
import RollupOnboarding from './RollupOnboarding'
import SolidStartOnboarding from './SolidStartOnboarding'
import SvelteKitOnboarding from './SvelteKitOnboarding'
import ViteOnboarding from './ViteOnboarding'
import WebpackOnboarding from './WebpackOnboarding'

interface URLParams {
  provider: Provider
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
  Remix: 'Remix',
  Nuxt: 'Nuxt',
  SvelteKit: 'SvelteKit',
  SolidStart: 'SolidStart',
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
  } else if (path === urls.Remix) {
    return BUNDLER_OPTIONS.Remix
  } else if (path === urls.Nuxt) {
    return BUNDLER_OPTIONS.Nuxt
  } else if (path === urls.SvelteKit) {
    return BUNDLER_OPTIONS.SvelteKit
  } else if (path === urls.SolidStart) {
    return BUNDLER_OPTIONS.SolidStart
  } else {
    return BUNDLER_OPTIONS.Vite
  }
}

interface BundlerSelectorProps {
  provider: Provider
  owner: string
  repo: string
}

function BundlerSelector({ provider, owner, repo }: BundlerSelectorProps) {
  const location = useLocation()
  const history = useHistory()
  const {
    bundleNuxtOnboarding,
    bundleOnboarding,
    bundleRemixOnboarding,
    bundleRollupOnboarding,
    bundleSolidStartOnboarding,
    bundleSvelteKitOnboarding,
    bundleWebpackOnboarding,
  } = useNavLinks()
  const urls = {
    Vite: bundleOnboarding.path({ provider, owner, repo }),
    Rollup: bundleRollupOnboarding.path({ provider, owner, repo }),
    Webpack: bundleWebpackOnboarding.path({ provider, owner, repo }),
    Remix: bundleRemixOnboarding.path({ provider, owner, repo }),
    Nuxt: bundleNuxtOnboarding.path({ provider, owner, repo }),
    SvelteKit: bundleSvelteKitOnboarding.path({ provider, owner, repo }),
    SolidStart: bundleSolidStartOnboarding.path({ provider, owner, repo }),
  }

  const itemClass = 'flex-none w-[calc((100%-32px)/3)]'

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
          className="flex-wrap"
        >
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Vite}
            data-testid="vite-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using Vite</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Rollup}
            data-testid="rollup-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using Rollup</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Webpack}
            data-testid="webpack-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using Webpack</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Remix}
            data-testid="remix-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using Remix (Vite)</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.Nuxt}
            data-testid="nuxt-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using Nuxt</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.SvelteKit}
            data-testid="sveltekit-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using SvelteKit</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={BUNDLER_OPTIONS.SolidStart}
            data-testid="solidstart-radio"
            className={itemClass}
          >
            <RadioTileGroup.Label>Using SolidStart</RadioTileGroup.Label>
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
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/remix-vite">
          <RemixOnboarding />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/nuxt">
          <NuxtOnboarding />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/solidstart">
          <SolidStartOnboarding />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/sveltekit">
          <SvelteKitOnboarding />
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
      event: EVENT_METRICS.VISITED_PAGE,
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

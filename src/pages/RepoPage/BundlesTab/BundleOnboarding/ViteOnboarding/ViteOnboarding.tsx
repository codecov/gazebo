import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { metrics } from 'shared/utils/metrics'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

const npmInstall = `npm install @codecov/vite-plugin --save-dev`
const yarnInstall = `yarn add @codecov/vite-plugin --dev`
const pnpmInstall = `pnpm add @codecov/vite-plugin --save-dev`

const pluginConfig = `// vite.config.js
import { defineConfig } from "vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov vite plugin after all other plugins
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "<bundle project name>",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});`

const commitString = `git add -A && git commit -m "Added Codecov bundler plugin"`

const npmBuild = `npm run build`
const yarnBuild = `yarn run build`
const pnpmBuild = `pnpm run build`

const copiedInstallCommand = (packageManager: 'npm' | 'yarn' | 'pnpm') => {
  metrics.increment('bundles_tab.onboarding.vite.copied.install_command', 1, {
    tags: {
      // eslint-disable-next-line camelcase
      package_manager: packageManager,
    },
  })
}

const copiedBuildCommand = (packageManager: 'npm' | 'yarn' | 'pnpm') => {
  metrics.increment('bundles_tab.onboarding.vite.copied.build_command', 1, {
    tags: {
      // eslint-disable-next-line camelcase
      package_manager: packageManager,
    },
  })
}

const StepOne: React.FC = () => {
  return (
    <div className="pt-4">
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 1:</span> Install the Codecov Vite
        Plugin
      </h2>
      <p className="pb-2 text-sm">
        To install the{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          @codecov/vite-plugin
        </span>{' '}
        to your project, use one of the following commands.
      </p>
      <div className="flex flex-col gap-4">
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {npmInstall}{' '}
          <CopyClipboard
            string={npmInstall}
            testIdExtension="-npm-install"
            onClick={() => {
              copiedInstallCommand('npm')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {yarnInstall}{' '}
          <CopyClipboard
            string={yarnInstall}
            testIdExtension="-yarn-install"
            onClick={() => {
              copiedInstallCommand('yarn')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {pnpmInstall}{' '}
          <CopyClipboard
            string={pnpmInstall}
            testIdExtension="-pnpm-install"
            onClick={() => {
              copiedInstallCommand('pnpm')
            }}
          />
        </pre>
      </div>
    </div>
  )
}

const StepTwo: React.FC<{ uploadToken: string }> = ({ uploadToken }) => {
  return (
    <div className="pt-4">
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 2:</span> Copy Codecov token
      </h2>
      <p className="pb-2 text-sm">
        Set an environment variable in your build environment with the following
        upload token.
      </p>
      <div className="flex flex-col gap-4">
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          CODECOV_TOKEN={uploadToken}{' '}
          <CopyClipboard
            string={uploadToken}
            testIdExtension="-upload-token"
            onClick={() => {
              metrics.increment('bundles_tab.onboarding.vite.copied.token', 1)
            }}
          />
        </pre>
      </div>
    </div>
  )
}

const StepThree: React.FC = () => {
  return (
    <div>
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 3:</span> Configure the bundler
        plugin
      </h2>
      <p className="pb-2 selection:text-sm">
        Import the bundler plugin, and add it to the end of your plugin array
        found inside your{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          vite.config.js
        </span>{' '}
        file.
      </p>
      <pre className="flex items-start justify-between overflow-auto whitespace-pre rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
        {pluginConfig}
        <CopyClipboard
          string={pluginConfig}
          testIdExtension="-plugin-config"
          onClick={() => {
            metrics.increment('bundles_tab.onboarding.vite.copied.config', 1)
          }}
        />
      </pre>
    </div>
  )
}

const StepFour: React.FC = () => {
  return (
    <div>
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 4:</span> Commit your latest
        changes
      </h2>
      <p className="pb-2 text-sm">
        The plugin requires at least one commit to be made to properly upload
        bundle analysis information up to Codecov.
      </p>
      <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
        {commitString}{' '}
        <CopyClipboard
          string={commitString}
          testIdExtension="-commit-command"
          onClick={() => {
            metrics.increment('bundles_tab.onboarding.vite.copied.commit', 1)
          }}
        />
      </pre>
    </div>
  )
}

const StepFive: React.FC = () => {
  return (
    <div>
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 5:</span> Build the application
      </h2>
      <p className="pb-2 text-sm">
        When building your application the plugin will automatically upload the
        stats information to Codecov.
      </p>
      <div className="flex flex-col gap-4">
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {npmBuild}{' '}
          <CopyClipboard
            string={npmBuild}
            testIdExtension="-npm-build"
            onClick={() => {
              copiedBuildCommand('npm')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {yarnBuild}{' '}
          <CopyClipboard
            string={yarnBuild}
            testIdExtension="-yarn-build"
            onClick={() => {
              copiedBuildCommand('yarn')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {pnpmBuild}{' '}
          <CopyClipboard
            string={pnpmBuild}
            testIdExtension="-pnpm-build"
            onClick={() => {
              copiedBuildCommand('pnpm')
            }}
          />
        </pre>
      </div>
    </div>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const ViteOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  let uploadToken: string = repoData?.repository?.uploadToken
  if (orgUploadToken) {
    uploadToken = orgUploadToken
  }

  useEffect(() => {
    metrics.increment('bundles_tab.onboarding.visited_page', 1, {
      tags: {
        bundler: 'vite',
      },
    })
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <StepOne />
      <StepTwo uploadToken={uploadToken} />
      <StepThree />
      <StepFour />
      <StepFive />
      <div>
        <p className="border-l-2 border-ds-gray-secondary pl-4">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A
            to={{ pageName: 'bundleConfigFeedback' }}
            isExternal
            hook="repo-config-feedback"
          >
            this issue
          </A>
        </p>
      </div>
    </div>
  )
}

export default ViteOnboarding

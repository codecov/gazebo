import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

import {
  copiedBuildCommandMetric,
  copiedCommitMetric,
  copiedConfigMetric,
  copiedInstallCommandMetric,
  copiedTokenMetric,
  visitedOnboardingMetric,
} from '../metricHelpers'

const npmInstall = `npm install @codecov/rollup-plugin --save-dev`
const yarnInstall = `yarn add @codecov/rollup-plugin --dev`
const pnpmInstall = `pnpm add @codecov/rollup-plugin --save-dev`

const pluginConfig = `// rollup.config.js
import { defineConfig } from "rollup";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov rollup plugin after all other plugins
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "<bundle project name>",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});`

const commitString = `git add -A && git commit -m "Added Codecov bundler plugin" && git push`

const npmBuild = `npm run build`
const yarnBuild = `yarn run build`
const pnpmBuild = `pnpm run build`

const StepOne: React.FC = () => {
  return (
    <div className="pt-4">
      <h2 className="pb-2 text-base">
        <span className="font-semibold">Step 1:</span> Install the Codecov
        Rollup Plugin
      </h2>
      <p className="pb-2 text-sm">
        To install the{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          @codecov/rollup-plugin
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
              copiedInstallCommandMetric('npm', 'rollup')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {yarnInstall}{' '}
          <CopyClipboard
            string={yarnInstall}
            testIdExtension="-yarn-install"
            onClick={() => {
              copiedInstallCommandMetric('yarn', 'rollup')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {pnpmInstall}{' '}
          <CopyClipboard
            string={pnpmInstall}
            testIdExtension="-pnpm-install"
            onClick={() => {
              copiedInstallCommandMetric('pnpm', 'rollup')
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
      <div className="flex gap-4">
        <pre className="flex basis-1/3 items-center justify-between gap-2 rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          <div className="w-0 flex-1 overflow-hidden" data-testid="token-key">
            CODECOV_TOKEN
          </div>
          <CopyClipboard string="CODECOV_TOKEN" />
        </pre>
        <pre className="flex basis-2/3 items-center justify-between gap-2 rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          <div className="w-0 flex-1 overflow-hidden">{uploadToken}</div>
          <CopyClipboard
            string={uploadToken}
            testIdExtension="-upload-token"
            onClick={() => {
              copiedTokenMetric('rollup')
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
      <p className="pb-2 text-sm">
        Import the bundler plugin, and add it to the end of your plugin array
        found inside your{' '}
        <span className="bg-ds-gray-primary px-1 font-mono">
          rollup.config.js
        </span>{' '}
        file.
      </p>
      <pre className="flex items-start justify-between overflow-auto whitespace-pre rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
        {pluginConfig}
        <CopyClipboard
          string={pluginConfig}
          testIdExtension="-plugin-config"
          onClick={() => {
            copiedConfigMetric('rollup')
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
        <span className="font-semibold">Step 4:</span> Commit and push your
        latest changes
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
            copiedCommitMetric('rollup')
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
              copiedBuildCommandMetric('npm', 'rollup')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {yarnBuild}{' '}
          <CopyClipboard
            string={yarnBuild}
            testIdExtension="-yarn-build"
            onClick={() => {
              copiedBuildCommandMetric('yarn', 'rollup')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          {pnpmBuild}{' '}
          <CopyClipboard
            string={pnpmBuild}
            testIdExtension="-pnpm-build"
            onClick={() => {
              copiedBuildCommandMetric('pnpm', 'rollup')
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

const RollupOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  const uploadToken = orgUploadToken ?? repoData?.repository?.uploadToken ?? ''

  useEffect(() => {
    visitedOnboardingMetric('rollup')
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

export default RollupOnboarding

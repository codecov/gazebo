import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CopyClipboard } from 'ui/CopyClipboard'

import {
  copiedBuildCommandMetric,
  copiedCommitMetric,
  copiedConfigMetric,
  copiedInstallCommandMetric,
  copiedTokenMetric,
  visitedOnboardingMetric,
} from '../metricHelpers'

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

const commitString = `git add -A && git commit -m "Add Codecov bundler plugin" && git push`

const npmBuild = `npm run build`
const yarnBuild = `yarn run build`
const pnpmBuild = `pnpm run build`

const StepOne: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: Install the Codecov Vite Plugin
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          To install the{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            @codecov/vite-plugin
          </span>{' '}
          to your project, use one of the following commands.
        </p>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
          {npmInstall}{' '}
          <CopyClipboard
            value={npmInstall}
            data-testid="clipboard-npm-install"
            onClick={() => {
              copiedInstallCommandMetric('npm', 'vite')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
          {yarnInstall}{' '}
          <CopyClipboard
            value={yarnInstall}
            data-testid="clipboard-yarn-install"
            onClick={() => {
              copiedInstallCommandMetric('yarn', 'vite')
            }}
          />
        </pre>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
          {pnpmInstall}{' '}
          <CopyClipboard
            value={pnpmInstall}
            data-testid="clipboard-pnpm-install"
            onClick={() => {
              copiedInstallCommandMetric('pnpm', 'vite')
            }}
          />
        </pre>
      </Card.Content>
    </Card>
  )
}

const StepTwo: React.FC<{ uploadToken: string }> = ({ uploadToken }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Step 2: Copy Codecov token</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Set an environment variable in your build environment with the
          following upload token.
        </p>
        <div className="flex gap-4">
          <pre className="flex basis-1/3 items-center justify-between gap-2 rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            <div className="w-0 flex-1 overflow-hidden" data-testid="token-key">
              CODECOV_TOKEN
            </div>
            <CopyClipboard value="CODECOV_TOKEN" />
          </pre>
          <pre className="flex basis-2/3 items-center justify-between gap-2 rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            <div className="w-0 flex-1 overflow-hidden">{uploadToken}</div>
            <CopyClipboard
              value={uploadToken}
              data-testid="clipboard-upload-token"
              onClick={() => {
                copiedTokenMetric('vite')
              }}
            />
          </pre>
        </div>
      </Card.Content>
    </Card>
  )
}

const StepThree: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 3: Configure the bundler plugin
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Import the bundler plugin, and add it to the end of your plugin array
          found inside your{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            vite.config.js
          </span>{' '}
          file.
        </p>
        <pre className="relative flex items-start justify-between overflow-auto whitespace-pre rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
          {pluginConfig}
          <CopyClipboard
            value={pluginConfig}
            data-testid="clipboard-plugin-config"
            onClick={() => {
              copiedConfigMetric('vite')
            }}
          />
        </pre>
      </Card.Content>
    </Card>
  )
}

const StepFour: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 4: Commit and push your latest changes
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          The plugin requires at least one commit to be made to properly upload
          bundle analysis information up to Codecov.
        </p>
        <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
          {commitString}{' '}
          <CopyClipboard
            value={commitString}
            data-testid="clipboard-commit-command"
            onClick={() => {
              copiedCommitMetric('vite')
            }}
          />
        </pre>
      </Card.Content>
    </Card>
  )
}

const StepFive: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Step 5: Build the application</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          When building your application the plugin will automatically upload
          the stats information to Codecov.
        </p>
        <div className="flex flex-col gap-4">
          <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            {npmBuild}{' '}
            <CopyClipboard
              value={npmBuild}
              data-testid="clipboard-npm-build"
              onClick={() => {
                copiedBuildCommandMetric('npm', 'vite')
              }}
            />
          </pre>
          <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            {yarnBuild}{' '}
            <CopyClipboard
              value={yarnBuild}
              data-testid="clipboard-yarn-build"
              onClick={() => {
                copiedBuildCommandMetric('yarn', 'vite')
              }}
            />
          </pre>
          <pre className="flex w-full items-center justify-between gap-2 overflow-auto whitespace-pre-wrap rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            {pnpmBuild}{' '}
            <CopyClipboard
              value={pnpmBuild}
              data-testid="clipboard-pnpm-build"
              onClick={() => {
                copiedBuildCommandMetric('pnpm', 'vite')
              }}
            />
          </pre>
        </div>
      </Card.Content>
    </Card>
  )
}

function FeedbackCTA() {
  return (
    <Card>
      <Card.Content>
        <p>
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
      </Card.Content>
    </Card>
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

  const uploadToken = orgUploadToken ?? repoData?.repository?.uploadToken ?? ''

  useEffect(() => {
    visitedOnboardingMetric('vite')
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <StepOne />
      <StepTwo uploadToken={uploadToken} />
      <StepThree />
      <StepFour />
      <StepFive />
      <FeedbackCTA />
    </div>
  )
}

export default ViteOnboarding

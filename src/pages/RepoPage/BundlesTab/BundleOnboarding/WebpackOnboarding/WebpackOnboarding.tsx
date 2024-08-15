import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import LearnMoreBlurb from '../LearnMoreBlurb'
import {
  copiedBuildCommandMetric,
  copiedCommitMetric,
  copiedConfigMetric,
  copiedInstallCommandMetric,
  copiedTokenMetric,
  visitedOnboardingMetric,
} from '../metricHelpers'

const npmInstall = `npm install @codecov/webpack-plugin --save-dev`
const yarnInstall = `yarn add @codecov/webpack-plugin --dev`
const pnpmInstall = `pnpm add @codecov/webpack-plugin --save-dev`

const pluginConfig = `// webpack.config.js
const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

module.exports = {
  /* ... */
  plugins: [
    // Put the Codecov webpack plugin after all other plugins
    codecovWebpackPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "example-webpack-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};`

const commitString = `git add -A && git commit -m "Add Codecov bundler plugin" && git push`

const npmBuild = `npm run build`
const yarnBuild = `yarn run build`
const pnpmBuild = `pnpm run build`

const StepOne: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: Install the Codecov Webpack Plugin
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          To install the{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            @codecov/webpack-plugin
          </span>{' '}
          to your project, use one of the following commands.
        </p>
        <CodeSnippet
          clipboard={npmInstall}
          clipboardOnClick={() => {
            copiedInstallCommandMetric('npm', 'webpack')
          }}
          data-testid="webpack-npm-install"
        >
          {npmInstall}
        </CodeSnippet>
        <CodeSnippet
          clipboard={yarnInstall}
          clipboardOnClick={() => {
            copiedInstallCommandMetric('yarn', 'webpack')
          }}
          data-testid="webpack-yarn-install"
        >
          {yarnInstall}
        </CodeSnippet>
        <CodeSnippet
          clipboard={pnpmInstall}
          clipboardOnClick={() => {
            copiedInstallCommandMetric('pnpm', 'webpack')
          }}
          data-testid="webpack-pnpm-install"
        >
          {pnpmInstall}
        </CodeSnippet>
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
          <CodeSnippet className="basis-1/3" clipboard="CODECOV_TOKEN">
            CODECOV_TOKEN
          </CodeSnippet>
          <CodeSnippet
            className="basis-2/3"
            clipboard={uploadToken}
            clipboardOnClick={() => {
              copiedTokenMetric('webpack')
            }}
            data-testid="webpack-upload-token"
          >
            {uploadToken}
          </CodeSnippet>
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
            webpack.config.js
          </span>{' '}
          file.
        </p>
        <p>
          For NextJS users, please see their docs for configuring Webpack inside
          the{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            next.config.js
          </span>{' '}
          file{' '}
          <A
            isExternal
            to={{ pageName: 'nextJSCustomConfig' }}
            hook="custom-next-webpack-config"
          >
            here.
          </A>
        </p>
        <CodeSnippet
          clipboard={pluginConfig}
          clipboardOnClick={() => {
            copiedConfigMetric('webpack')
          }}
          data-testid="webpack-plugin-config"
        >
          {pluginConfig}
        </CodeSnippet>
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
          bundle analysis information to Codecov.
        </p>
        <CodeSnippet
          clipboard={commitString}
          clipboardOnClick={() => {
            copiedCommitMetric('webpack')
          }}
          data-testid="webpack-commit-command"
        >
          {commitString}
        </CodeSnippet>
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
        <CodeSnippet
          clipboard={npmBuild}
          clipboardOnClick={() => {
            copiedBuildCommandMetric('npm', 'webpack')
          }}
          data-testid="webpack-npm-build"
        >
          {npmBuild}
        </CodeSnippet>
        <CodeSnippet
          clipboard={yarnBuild}
          clipboardOnClick={() => {
            copiedBuildCommandMetric('yarn', 'webpack')
          }}
          data-testid="webpack-yarn-build"
        >
          {yarnBuild}
        </CodeSnippet>
        <CodeSnippet
          clipboard={pnpmBuild}
          clipboardOnClick={() => {
            copiedBuildCommandMetric('pnpm', 'webpack')
          }}
          data-testid="webpack-pnpm-build"
        >
          {pnpmBuild}
        </CodeSnippet>
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

const WebpackOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  const uploadToken = orgUploadToken ?? repoData?.repository?.uploadToken ?? ''

  useEffect(() => {
    visitedOnboardingMetric('webpack')
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <StepOne />
      <StepTwo uploadToken={uploadToken} />
      <StepThree />
      <StepFour />
      <StepFive />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

export default WebpackOnboarding

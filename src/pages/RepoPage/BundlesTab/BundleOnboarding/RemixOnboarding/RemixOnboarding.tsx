import React from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import LearnMoreBlurb from '../LearnMoreBlurb'

const npmInstall = `npm install @codecov/remix-vite-plugin --save-dev`
const yarnInstall = `yarn add @codecov/remix-vite-plugin --dev`
const pnpmInstall = `pnpm add @codecov/remix-vite-plugin --save-dev`

const pluginConfig = `// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { codecovRemixVitePlugin } from "@codecov/remix-vite-plugin";

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths()
    // Put the Codecov Remix Vite plugin after all other plugins
    codecovRemixVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "example-remix-bundle",
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
          Step 1: Install the Codecov Remix Vite Plugin
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          To install the{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            @codecov/remix-vite-plugin
          </span>{' '}
          to your project, use one of the following commands.
        </p>
        <CodeSnippet clipboard={npmInstall} data-testid="remix-npm-install">
          {npmInstall}
        </CodeSnippet>
        <CodeSnippet clipboard={yarnInstall} data-testid="remix-yarn-install">
          {yarnInstall}
        </CodeSnippet>
        <CodeSnippet clipboard={pnpmInstall} data-testid="remix-pnpm-install">
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
            data-testid="remix-upload-token"
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
          Add the plugin to the end of your modules array found inside your{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            vite.config.ts
          </span>{' '}
          file, and pass your configuration.
        </p>
        <CodeSnippet clipboard={pluginConfig} data-testid="remix-plugin-config">
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
          data-testid="remix-commit-command"
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
        <CodeSnippet clipboard={npmBuild} data-testid="remix-npm-build">
          {npmBuild}
        </CodeSnippet>
        <CodeSnippet clipboard={yarnBuild} data-testid="remix-yarn-build">
          {yarnBuild}
        </CodeSnippet>
        <CodeSnippet clipboard={pnpmBuild} data-testid="remix-pnpm-build">
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

const RemixOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  const uploadToken = orgUploadToken ?? repoData?.repository?.uploadToken ?? ''

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

export default RemixOnboarding

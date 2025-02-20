import React from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import LearnMoreBlurb from '../LearnMoreBlurb'

const npmInstall = `npm install @codecov/solidstart-plugin --save-dev`
const yarnInstall = `yarn add @codecov/solidstart-plugin --dev`
const pnpmInstall = `pnpm add @codecov/solidstart-plugin --save-dev`

const pluginConfig = `// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import solidPlugin from "vite-plugin-solid";
import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";

export default defineConfig({
  vite: {
    plugins: [
      // Put the Codecov SolidStart plugin after all other plugins
      solidPlugin(),
      codecovSolidStartPlugin({
        enableBundleAnalysis: true,
        bundleName: "example-solidstart-bundle",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
  },
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
          Step 1: Install the Codecov SolidStart Plugin
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          To install the{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            @codecov/solidstart-plugin
          </span>{' '}
          to your project, use one of the following commands.
        </p>
        <CodeSnippet
          clipboard={npmInstall}
          data-testid="solidstart-npm-install"
        >
          {npmInstall}
        </CodeSnippet>
        <CodeSnippet
          clipboard={yarnInstall}
          data-testid="solidstart-yarn-install"
        >
          {yarnInstall}
        </CodeSnippet>
        <CodeSnippet
          clipboard={pnpmInstall}
          data-testid="solidstart-pnpm-install"
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
            data-testid="solidstart-upload-token"
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
            app.config.ts
          </span>{' '}
          file, and pass your configuration.
        </p>
        <CodeSnippet
          clipboard={pluginConfig}
          data-testid="solidstart-plugin-config"
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
          data-testid="solidstart-commit-command"
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
        <CodeSnippet clipboard={npmBuild} data-testid="solidstart-npm-build">
          {npmBuild}
        </CodeSnippet>
        <CodeSnippet clipboard={yarnBuild} data-testid="solidstart-yarn-build">
          {yarnBuild}
        </CodeSnippet>
        <CodeSnippet clipboard={pnpmBuild} data-testid="solidstart-pnpm-build">
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

const SolidStartOnboarding: React.FC = () => {
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

export default SolidStartOnboarding

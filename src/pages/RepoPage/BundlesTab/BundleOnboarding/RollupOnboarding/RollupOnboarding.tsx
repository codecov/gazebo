import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import LearnMoreBlurb from '../LearnMoreBlurb'

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

const commitString = `git add -A && git commit -m "Add Codecov bundler plugin" && git push`

const npmBuild = `npm run build`
const yarnBuild = `yarn run build`
const pnpmBuild = `pnpm run build`

const StepOne: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: Install the Codecov Rollup Plugin
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          To install the{' '}
          <span className="bg-ds-gray-primary px-1 font-mono">
            @codecov/rollup-plugin
          </span>{' '}
          to your project, use one of the following commands.
        </p>
        <CodeSnippet clipboard={npmInstall} data-testid="rollup-npm-install">
          {npmInstall}
        </CodeSnippet>
        <CodeSnippet clipboard={yarnInstall} data-testid="rollup-yarn-install">
          {yarnInstall}
        </CodeSnippet>
        <CodeSnippet clipboard={pnpmInstall} data-testid="rollup-pnpm-install">
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
            data-testid="rollup-upload-token"
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
            rollup.config.js
          </span>{' '}
          file.
        </p>
        <CodeSnippet
          clipboard={pluginConfig}
          data-testid="rollup-plugin-config"
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
          data-testid="rollup-commit-command"
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
        <CodeSnippet clipboard={npmBuild} data-testid="rollup-npm-build">
          {npmBuild}
        </CodeSnippet>
        <CodeSnippet clipboard={yarnBuild} data-testid="rollup-yarn-build">
          {yarnBuild}
        </CodeSnippet>
        <CodeSnippet clipboard={pnpmBuild} data-testid="rollup-pnpm-build">
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

const RollupOnboarding: React.FC = () => {
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

export default RollupOnboarding

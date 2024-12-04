import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  EVENT_METRICS,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics'
import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { ExpandableSection } from 'ui/ExpandableSection'
import Select from 'ui/Select'

import LearnMoreBlurb from '../LearnMoreBlurb'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function GitHubActions() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
    enabled: showOrgToken,
  })

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken ?? ''
  const tokenCopy = orgUploadToken ? 'global' : 'repository'

  const [framework, setFramework] = useState<Framework>('Jest')

  const frameworkInstructions = {
    Jest: {
      install: 'npm install --save-dev jest',
      run: 'npx jest --coverage',
      workflow: `name: Run tests and upload coverage

on: 
  push

jobs:
  test:
    name: Run tests and collect coverage
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Node
        uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npx jest --coverage

      - name: Upload results to Codecov
        uses: codecov/codecov-action@v5
        with:
          token: \${{ secrets.CODECOV_TOKEN }}${
            orgUploadToken
              ? `
          slug: ${owner}/${repo}`
              : ''
          }
`,
    },
    Vitest: {
      install: 'npm install --save-dev vitest @vitest/coverage-v8',
      run: 'npx vitest run --coverage',
      workflow: `name: Run tests and upload coverage

on: 
  push

jobs:
  test:
    name: Run tests and collect coverage
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Node
        uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npx vitest run --coverage

      - name: Upload results to Codecov
        uses: codecov/codecov-action@v5
        with:
          token: \${{ secrets.CODECOV_TOKEN }}${
            orgUploadToken
              ? `
          slug: ${owner}/${repo}`
              : ''
          }
`,
    },
    Pytest: {
      install: 'pip install pytest pytest-cov',
      run: 'pytest --cov --cov-report=xml',
      workflow: `name: Run tests and upload coverage

on: 
  push

jobs:
  test:
    name: Run tests and collect coverage
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v4

      - name: Install dependencies
        run: pip install pytest pytest-cov

      - name: Run tests
        run: pytest --cov --cov-report=xml

      - name: Upload results to Codecov
        uses: codecov/codecov-action@v5
        with:
          token: \${{ secrets.CODECOV_TOKEN }}${
            orgUploadToken
              ? `
          slug: ${owner}/${repo}`
              : ''
          }
`,
    },
    Go: {
      install: undefined,
      run: 'go test -coverprofile=coverage.txt',
      workflow: `name: Run tests and upload coverage

on: 
  push

jobs:
  test:
    name: Run tests and collect coverage
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Go
        uses: actions/setup-go@v5

      - name: Install dependencies
        run: go mod download

      - name: Run tests
        run: go test -coverprofile=coverage.txt

      - name: Upload results to Codecov
        uses: codecov/codecov-action@v5
        with:
          token: \${{ secrets.CODECOV_TOKEN }}${
            orgUploadToken
              ? `
          slug: ${owner}/${repo}`
              : ''
          }
`,
    },
  }

  return (
    <div className="flex flex-col gap-5">
      <Step1
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner={owner}
        setFramework={setFramework}
      />
      <Step2 tokenCopy={tokenCopy} uploadToken={uploadToken} />
      <Step3
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        orgUploadToken={orgUploadToken}
        owner={owner}
        repo={repo}
      />
      <Step4 />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

type Framework = 'Jest' | 'Vitest' | 'Pytest' | 'Go'
type FrameworkInstructions = {
  [key in Framework]: { install?: string; run?: string; workflow?: string }
}

interface Step1Props {
  framework: Framework
  frameworkInstructions: FrameworkInstructions
  owner: string
  setFramework: (value: Framework) => void
}

function Step1({
  framework,
  frameworkInstructions,
  owner,
  setFramework,
}: Step1Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Step 1: Output a Coverage report file in your CI
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            Codecov generally supports xml and json format. Select your language
            below to generate your coverage reports. If your language isn&apos;t
            listed, visit our{' '}
            <A
              to={{ pageName: 'exampleRepos' }}
              isExternal
              hook="supported-languages-docs"
            >
              supported languages doc
            </A>{' '}
            for example repositories. Codecov generally supports xml and json
            formats.
          </p>

          <div className="max-w-64">
            <Select
              // @ts-expect-error - Select has some TS issues because it's still written in JS
              items={Object.keys(frameworkInstructions)}
              value={framework}
              onChange={(value: Framework) => setFramework(value)}
            />
          </div>

          {frameworkInstructions[framework].install ? (
            <>
              <p>Install requirements in your terminal:</p>
              <CodeSnippet
                clipboard={frameworkInstructions[framework].install}
                clipboardOnClick={() =>
                  storeEventMetric({
                    owner,
                    event: EVENT_METRICS.COPIED_TEXT,
                    jsonPayload: { text: `coverage GHA ${framework} install` },
                  })
                }
              >
                {frameworkInstructions[framework].install}
              </CodeSnippet>
            </>
          ) : null}

          <p>In a GitHub Action, run tests and generate a coverage report:</p>
          <CodeSnippet
            clipboard={frameworkInstructions[framework].run}
            clipboardOnClick={() =>
              storeEventMetric({
                owner,
                event: EVENT_METRICS.COPIED_TEXT,
                jsonPayload: { text: `coverage GHA ${framework} run` },
              })
            }
          >
            {frameworkInstructions[framework].run}
          </CodeSnippet>
        </Card.Content>
      </Card>
    </div>
  )
}

interface Step2Props {
  tokenCopy: string
  uploadToken: string
}

function Step2({ tokenCopy, uploadToken }: Step2Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add {tokenCopy} token as{' '}
          <A
            to={{ pageName: 'githubRepoSecrets' }}
            isExternal
            hook="GitHub-repo-secrets-link"
          >
            repository secret
          </A>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Admin required to access repo configuration &gt; secrets and variable
          &gt; actions
        </p>
        <div className="flex gap-4">
          <CodeSnippet
            className="basis-1/3"
            clipboard="CODECOV_TOKEN"
            data-testid="token-key"
          >
            CODECOV_TOKEN
          </CodeSnippet>
          <CodeSnippet
            className="basis-2/3"
            clipboard={uploadToken}
            clipboardOnClick={() =>
              storeEventMetric({
                owner,
                event: EVENT_METRICS.COPIED_TEXT,
                jsonPayload: { text: 'Step 2 GHA' },
              })
            }
          >
            {uploadToken}
          </CodeSnippet>
        </div>
      </Card.Content>
    </Card>
  )
}

interface Step3Props {
  framework: Framework
  frameworkInstructions: FrameworkInstructions
  orgUploadToken: string | null | undefined
  owner: string
  repo: string
}

function Step3({
  framework,
  frameworkInstructions,
  orgUploadToken,
  owner,
  repo,
}: Step3Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()

  const step3Config = `- name: Upload coverage reports to Codecov
    uses: codecov/codecov-action@v5
    with:
      token: \${{ secrets.CODECOV_TOKEN }}${
        orgUploadToken
          ? `
      slug: ${owner}/${repo}`
          : ''
      }`

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Step 3: Add Codecov to your GitHub Actions workflow yaml file
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            After tests run, this will upload your coverage report to Codecov:
          </p>
          <CodeSnippet
            clipboard={step3Config}
            clipboardOnClick={() =>
              storeEventMetric({
                owner,
                event: EVENT_METRICS.COPIED_TEXT,
                jsonPayload: { text: `coverage GHA ${framework} upload` },
              })
            }
          >
            {step3Config}
          </CodeSnippet>
        </Card.Content>
      </Card>
      <ExpandableSection className="-mt-px">
        <ExpandableSection.Trigger>
          <p className="font-normal">
            Your final GitHub Actions workflow for a project using{' '}
            <span className="text-codecov-code">{framework}</span> could look
            something like this:
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          <CodeSnippet
            clipboard={frameworkInstructions[framework].workflow}
            clipboardOnClick={() =>
              storeEventMetric({
                owner,
                event: EVENT_METRICS.COPIED_TEXT,
                jsonPayload: { text: `coverage GHA ${framework} action` },
              })
            }
          >
            {frameworkInstructions[framework].workflow}
          </CodeSnippet>
          <p className="pt-4">
            <A
              to={{ pageName: 'exampleRepos' }}
              isExternal
              hook="supported-languages-docs"
            >
              Learn more
            </A>{' '}
            about generating coverage reports with {framework}.
          </p>
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

function Step4() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 4: merge to main or your preferred feature branch
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p>
          Once merged to your default branch, subsequent pull requests will have
          Codecov checks and comments. Additionally, you’ll find your repo
          coverage dashboard here. If you have merged, try reloading the page.
        </p>
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
            to={{ pageName: 'repoConfigFeedback' }}
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

export default GitHubActions

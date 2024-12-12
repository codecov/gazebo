import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { Provider } from 'shared/api/helpers'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import { Card } from 'ui/Card'

import MergeStep from './MergeStep'
import OutputCoverageStep from './OutputCoverageStep'
import TokenStep from './TokenStep'
import { Framework } from './types'
import WorkflowYMLStep from './WorkflowYMLStep'

import LearnMoreBlurb from '../LearnMoreBlurb'
interface URLParams {
  provider: Provider
  owner: string
  repo: string
}

function GitHubActions() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
    enabled: showOrgToken,
  })

  const [isUsingGlobalToken, setIsUsingGlobalToken] = useState<boolean>(true)
  const { data: repoData } = useRepo({ provider, owner, repo })
  const repoUploadToken = repoData?.repository?.uploadToken ?? ''
  const previouslyGeneratedOrgToken = useRef<string | null | undefined>()
  const { data: uploadTokenRequiredData } = useUploadTokenRequired({
    provider,
    owner,
  })
  const hasPreviouslyGeneratedOrgToken = !!previouslyGeneratedOrgToken.current
  const isUploadTokenRequired = uploadTokenRequiredData?.uploadTokenRequired
  const showTokenSelector =
    !isUploadTokenRequired || !previouslyGeneratedOrgToken.current
  // token step is shown if upload token is required and org token has been previously generated
  // or if global token is selected and org token has been generated when not previously generated
  // or if repo token picker is selected and exists
  const showAddTokenStep =
    (isUploadTokenRequired && hasPreviouslyGeneratedOrgToken) ||
    (isUsingGlobalToken && !!orgUploadToken) ||
    (!isUsingGlobalToken && !!repoUploadToken)

  // If orgUploadToken does not exist on initial render, set it to null and we
  // do not touch it again on rerenders
  if (previouslyGeneratedOrgToken.current === undefined) {
    previouslyGeneratedOrgToken.current = orgUploadToken ?? null
  }

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
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner={owner}
        setFramework={setFramework}
      />
      <TokenStep
        isUsingGlobalToken={isUsingGlobalToken}
        setIsUsingGlobalToken={setIsUsingGlobalToken}
        showAddTokenStep={showAddTokenStep}
        showTokenSelector={showTokenSelector}
      />
      <WorkflowYMLStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        stepNum={showTokenSelector && showAddTokenStep ? 4 : 3}
      />
      <MergeStep stepNum={showTokenSelector && showAddTokenStep ? 5 : 4} />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
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

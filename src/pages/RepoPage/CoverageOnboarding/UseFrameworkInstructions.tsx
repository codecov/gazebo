import { useMemo } from 'react'

export type Framework = 'Jest' | 'Vitest' | 'Pytest' | 'Go'
export type FrameworkInstructions = ReturnType<typeof UseFrameworkInstructions>

interface UseFrameworkInstructionsArgs {
  orgUploadToken?: string | null
  owner: string
  repo: string
}

export function UseFrameworkInstructions({
  orgUploadToken,
  owner,
  repo,
}: UseFrameworkInstructionsArgs) {
  return useMemo(
    () => ({
      Jest: {
        install: 'npm install --save-dev jest',
        run: 'npx jest --coverage',
        githubActionsWorkflow: `name: Run tests and upload coverage

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
          fetch-depth: 2

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
        githubActionsWorkflow: `name: Run tests and upload coverage

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
          fetch-depth: 2

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
        run: 'pytest --cov-branch --cov-report=xml',
        githubActionsWorkflow: `name: Run tests and upload coverage

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
          fetch-depth: 2

      - name: Set up Python
        uses: actions/setup-python@v4

      - name: Install dependencies
        run: pip install pytest pytest-cov

      - name: Run tests
        run: pytest --cov-branch --cov-report=xml

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
        githubActionsWorkflow: `name: Run tests and upload coverage

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
          fetch-depth: 2

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
    }),
    [orgUploadToken, owner, repo]
  )
}

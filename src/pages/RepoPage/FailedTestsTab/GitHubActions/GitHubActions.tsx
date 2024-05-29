import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { CopyClipboard } from 'ui/CopyClipboard'
import { ExpandableSection } from 'ui/ExpandableSection/ExpandableSection'

import FrameworkNavigator from './FrameworkNavigator'

function GitHubActions() {
  return (
    <div className="flex flex-col gap-6">
      <Step1 />
      <Step2 />
      {/*
      <Step3 />
      <FeedbackCTA /> */}
    </div>
  )
}

function Step1() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: Output a JUnit XML file in your CI
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Select the framework below to generate a JUnit XML file that contains
          the results of your test run.
        </p>
        <FrameworkNavigator />
      </Card.Content>
    </Card>
  )
}

const Step2Script = `- name: Upload test results to Codecov
  if: \${{ !cancelled() }}
  uses: codecov/test-results-action@v1
  with:
    token: \${{ secrets.CODECOV_TOKEN }}`

const JobsScript = `jobs:
  unit-test:
    name: Run unit tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Set up Python 3.11
        uses: actions/setup-python@v3
        with:
          python-version: 3.11
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Test with pytest
        run: |
          pytest --cov --junitxml=junit.xml
      # Copy and paste the codecov/test-results-action here
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: \${{ secrets.CODECOV_TOKEN }}
      - name: Upload test results to Codecov
        if: \${{ !cancelled() }}
        uses: codecov/test-results-action@v1
        with:
          token: \${{ secrets.CODECOV_TOKEN }}`

function Step2() {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Step 2: Add the script{' '}
            <code className="rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-1">
              codecov/test-results-action@v1
            </code>{' '}
            to your CI YAML file.
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            In your CI YAML file, add below scripts to the end of your test run.
          </p>
          <CodeSnippet>
            <div className="flex justify-between">
              <pre>{Step2Script}</pre>
              <CopyClipboard value={Step2Script} />
            </div>
          </CodeSnippet>
          <p>
            This action will download the Codecov CLI, and upload the{' '}
            <span className="text-codecov-code">junit.xml</span> file generated
            in the previous step to Codecov.
          </p>
        </Card.Content>
      </Card>
      <div className="mt-[-9px]">
        <ExpandableSection title="Your final ci.yaml file for a project using pytes could look something like this:">
          <CodeSnippet>
            <pre>{JobsScript}</pre>
          </CodeSnippet>
        </ExpandableSection>
      </div>
    </div>
  )
}
export default GitHubActions

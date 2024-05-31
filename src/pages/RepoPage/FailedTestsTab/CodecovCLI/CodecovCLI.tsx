import { useState } from 'react'

import testsPRComment from 'assets/svg/onboardingTests/testsPRComment.svg'
import testsRunning from 'assets/svg/onboardingTests/testsRunning.svg'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { CopyClipboard } from 'ui/CopyClipboard'
import { ExpandableSection } from 'ui/ExpandableSection/ExpandableSection'

function CodecovCLI() {
  return (
    <div className="flex flex-col gap-6">
      <Step1 />
      <Step2 />
      <Step3 />
      <Step4 />
      <VisitGuide />
    </div>
  )
}

function Step1() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: Install Codecov&apos;s CLI in your CI
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>Here&apos;s an example using pip</p>
        <CodeSnippet clipboard="pip install codecov">
          pip install codecov
        </CodeSnippet>
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
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Step 2: Add the script{' '}
            <code className="rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-1 text-sm">
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
              <div>
                <CopyClipboard value={Step2Script} />
              </div>
            </div>
          </CodeSnippet>
          <p>
            This action will download the Codecov CLI, and upload the{' '}
            <span className="text-ds-gray">junit.xml</span> file generated in
            the previous step to Codecov.
          </p>
        </Card.Content>
      </Card>
      <ExpandableSection className="mt-[-1px]">
        <ExpandableSection.Trigger
          isExpanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className="font-normal">
            Your final <span className="text-ds-gray">ci.yaml</span> file for a
            project using <span className="text-ds-gray">pytest</span> could
            look something like this:
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          <CodeSnippet>
            <div className="flex justify-between">
              <pre>{JobsScript}</pre>
              <div>
                <CopyClipboard value={JobsScript} className="block" />
              </div>
            </div>
          </CodeSnippet>
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

function Step3() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">Step 3: Run your test suit</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            You can inspect the workflow logs to see if the call to Codecov
            succeeded.
          </p>
          <img src={testsRunning.toString()} alt="CLI tests" />
          <p>
            Run your tests as usual. You need to fail some tests to view the
            failed tests report.
          </p>
        </Card.Content>
      </Card>
      <ExpandableSection className="mt-[-1px]">
        <ExpandableSection.Trigger
          isExpanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className="font-normal">
            Here are examples of failed test reports in PR comments. Comment
            generation may take time.
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          <img
            src={testsPRComment.toString()}
            alt="Tests in PR comment"
            className="w-full"
          />
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

function Step4() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Step 4: View results and insights</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-1">
        <p>
          After the test run completion, you&apos;ll be able to see the failed
          tests result on the following areas:
        </p>
        <ul className="list-inside list-disc">
          <li>Github pull request comment</li>
          <li>Failed tests dashboard here.</li>
        </ul>
      </Card.Content>
    </Card>
  )
}
function VisitGuide() {
  return (
    <Card>
      <Card.Content>
        <p>
          Visit our guide to{' '}
          <A
            to={{
              pageName: 'testsAnalytics',
            }}
            isExternal={true}
            hook="failed-tests-onboarding"
          >
            learn more
          </A>{' '}
          about test ingestion.
        </p>
      </Card.Content>
    </Card>
  )
}

export default CodecovCLI

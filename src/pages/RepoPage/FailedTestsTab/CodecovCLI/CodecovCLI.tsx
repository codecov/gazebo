import testsPRComment from 'assets/svg/onboardingTests/testsPRComment.svg'
import testsPRCommentDark from 'assets/svg/onboardingTests/testsPRCommentDark.svg'
import testsRunning from 'assets/svg/onboardingTests/testsRunning.svg'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { ExpandableSection } from 'ui/ExpandableSection/ExpandableSection'

import { FrameworkTabsCard } from '../FrameworkTabsCard'

function CodecovCLI() {
  return (
    <div className="flex flex-col gap-6">
      <Step1 />
      <Step2 />
      <Step3 />
      <Step4 />
      <Step5 />
      <Step6 />
      <VisitGuide />
    </div>
  )
}

const Step1Script = 'pip install codecov-cli'

const Step1 = FrameworkTabsCard

function Step2() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: Install Codecov&apos;s CLI in your CI
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>Here&apos;s an example using pip</p>
        <CodeSnippet clipboard={Step1Script}>{Step1Script}</CodeSnippet>
      </Card.Content>
    </Card>
  )
}

const Step3Script = `codecovcli do-upload --report-type test_results --file <report_name>.junit.xml`

function Step3() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 3: Upload this file to Codecov using the CLI
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          The following snippet instructs the CLI to to upload this report to
          Codecov.
        </p>
        <CodeSnippet clipboard={Step3Script}>{Step3Script}</CodeSnippet>
        <p>
          Be sure to specify{' '}
          <span className="text-codecov-code">--report-type</span> as
          <span className="text-codecov-code"> test_results</span> and include
          the file you created in Step 2. This will not necessarily upload
          coverage reports to Codecov.
        </p>
      </Card.Content>
    </Card>
  )
}

const Step4Script = `codecovcli upload-process`

function Step4() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 4: Upload coverage to Codecov using the CLI
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Codecov offers existing wrappers for the CLI (Github Actions, Circle
          CI Orb, Bitrise Step) that makes uploading coverage to Codecov easy,
          as described{' '}
          <A
            to={{ pageName: 'uploaderCLI' }}
            isExternal={true}
            hook="failed-tests-onboarding"
          >
            here
          </A>
          .
        </p>
        <p>
          If you&apos;re running a different CI, you can upload coverage as
          follows:
        </p>
        <CodeSnippet clipboard={Step4Script}>{Step4Script}</CodeSnippet>
        <p>
          Go ahead and merge these changes in. In the next step we&apos;ll
          verify if things are working correctly.
        </p>
      </Card.Content>
    </Card>
  )
}

function Step5() {
  const { theme } = useThemeContext()

  const testPRsImageSource =
    theme === Theme.LIGHT ? testsPRComment : testsPRCommentDark

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">Step 5: Run your test suite</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            You can inspect the workflow logs to see if the call to Codecov
            succeeded.
          </p>
          <img src={testsRunning.toString()} alt="CLI tests" />
          <p>
            Run your tests as usual. You need to have some failed tests to view
            the failed tests report.
          </p>
        </Card.Content>
      </Card>
      <ExpandableSection className="-mt-px">
        <ExpandableSection.Trigger>
          <p>
            Here are examples of failed test reports in PR comments. Comment
            generation may take time.
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          <img
            src={testPRsImageSource.toString()}
            alt="Tests in PR comment"
            className="w-full"
          />
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

function Step6() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">Step 6: View results and insights</Card.Title>
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

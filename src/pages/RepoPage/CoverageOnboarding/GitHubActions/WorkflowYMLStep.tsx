import { useParams } from 'react-router-dom'

import { eventTracker } from 'services/events/events'
import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { ExpandableSection } from 'ui/ExpandableSection'

import { Framework, FrameworkInstructions } from '../UseFrameworkInstructions'

interface WorkflowYMLStepProps {
  framework: Framework
  frameworkInstructions: FrameworkInstructions
  stepNum: number
}

interface URLParams {
  provider: Provider
  owner: string
  repo: string
}

function WorkflowYMLStep({
  framework,
  frameworkInstructions,
  stepNum,
}: WorkflowYMLStepProps) {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
  })

  const workflowYMLConfig = `- name: Upload coverage reports to Codecov
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
            Step {stepNum}: Add Codecov to your GitHub Actions workflow yaml
            file
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            After tests run, this will upload your coverage report to Codecov:
          </p>
          <CodeSnippet
            clipboard={workflowYMLConfig}
            clipboardOnClick={() =>
              eventTracker().track({
                type: 'Button Clicked',
                properties: {
                  buttonName: 'Copy',
                  buttonLocation: 'Coverage onboarding',
                  ciProvider: 'GitHub Actions',
                  testingFramework: framework,
                  copied: 'YAML snippet',
                },
              })
            }
            // this is a comment
          >
            {workflowYMLConfig}
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
            clipboard={frameworkInstructions[framework].githubActionsWorkflow}
            clipboardOnClick={() =>
              eventTracker().track({
                type: 'Button Clicked',
                properties: {
                  buttonName: 'Copy',
                  buttonLocation: 'Coverage onboarding',
                  ciProvider: 'GitHub Actions',
                  testingFramework: framework,
                  copied: 'Example workflow',
                },
              })
            }
          >
            {frameworkInstructions[framework].githubActionsWorkflow}
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

export default WorkflowYMLStep

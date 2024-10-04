import { Card } from 'ui/Card'
import { ExpandableSection } from 'ui/ExpandableSection'

const CodecovAICommands: React.FC = () => {
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">Codecov AI Commands</Card.Title>
        </Card.Header>
        <Card.Content>
          After installing the app, use these commands in your PR comments:
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <span className="rounded border border-gray-200 bg-gray-100 px-1 font-semibold">
                @codecov-ai-reviewer test
              </span>
              -- the assistant will generate tests for the PR.
            </li>
            <li>
              <span className="rounded border border-gray-200 bg-gray-100 px-1 font-semibold">
                @codecov-ai-reviewer review
              </span>
              -- the assistant will review the PR and make suggestions.
            </li>
          </ul>
        </Card.Content>
      </Card>
      <ExpandableSection className="-mt-px">
        <ExpandableSection.Trigger>
          <p>
            Here is an example of Codecov AI Reviewer in PR comments. Comment
            generation may take time.
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          Screenshot goes here
        </ExpandableSection.Content>
      </ExpandableSection>
      <ExpandableSection className="-mt-2 border-t-0">
        <ExpandableSection.Trigger>
          <p>
            Here is an example of Codecov AI Test Generator in PR comments.
            Comment generation may take time.
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          Screenshot goes here
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

export default CodecovAICommands

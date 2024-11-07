import darkModeImage from 'assets/codecovAI/pr-review-example-dark-mode.png'
import lightModeImage from 'assets/codecovAI/pr-review-example-light-mode.png'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import { Card } from 'ui/Card'
import { ExpandableSection } from 'ui/ExpandableSection'

const CodecovAICommands: React.FC = () => {
  const { theme } = useThemeContext()
  const prReviewExampleSource =
    theme === Theme.DARK ? darkModeImage : lightModeImage
  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">Codecov AI Commands</Card.Title>
        </Card.Header>
        <Card.Content>
          After installing the app, use this command in your PR comments:
          <ul className="mt-2 list-inside list-disc space-y-1">
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
        <ExpandableSection.Content className="m-0 p-0">
          <img
            className="size-full object-cover"
            alt="codecov pr review example"
            src={prReviewExampleSource}
          />
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

export default CodecovAICommands

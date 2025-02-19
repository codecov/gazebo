import {
  EVENT_METRICS,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics/useStoreCodecovEventMetric'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import Select from 'ui/Select'

import { Framework, FrameworkInstructions } from '../UseFrameworkInstructions'

interface OutputCoverageStepProps {
  framework: Framework
  frameworkInstructions: FrameworkInstructions
  owner: string
  setFramework: (value: Framework) => void
}

function OutputCoverageStep({
  framework,
  frameworkInstructions,
  owner,
  setFramework,
}: OutputCoverageStepProps) {
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
            Select your language below to generate your coverage reports. If
            your language isn&apos;t listed, visit our{' '}
            <A
              to={{ pageName: 'exampleRepos' }}
              isExternal
              hook="supported-languages-docs"
            >
              supported languages doc
            </A>{' '}
            for example repositories. Codecov generally supports XML and JSON
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

export default OutputCoverageStep

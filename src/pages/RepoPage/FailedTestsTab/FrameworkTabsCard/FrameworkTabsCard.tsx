import { Card } from 'ui/Card'

import { FrameworkTabs } from './FrameworkTabs'

export function FrameworkTabsCard() {
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
        <FrameworkTabs />
      </Card.Content>
    </Card>
  )
}

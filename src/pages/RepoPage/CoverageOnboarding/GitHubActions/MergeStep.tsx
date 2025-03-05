import { Card } from 'ui/Card'

function MergeStep({ stepNum }: { stepNum: number }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step {stepNum}: merge to main or your preferred feature branch
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p>
          Once merged to your default branch, subsequent pull requests will have
          Codecov checks and comments. Additionally, you&apos;ll find your repo
          coverage dashboard here. If you have merged, try reloading the page.
        </p>
      </Card.Content>
    </Card>
  )
}

export default MergeStep

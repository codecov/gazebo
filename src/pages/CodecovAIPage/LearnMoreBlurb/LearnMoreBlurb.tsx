import A from 'ui/A'
import { Card } from 'ui/Card'

// TODO: Update link to docs once they are available
function LearnMoreBlurb() {
  return (
    <div className="-mt-2">
      <Card>
        <Card.Content>
          <p>
            Visit our guide to{' '}
            <A
              to={{ pageName: 'quickStart' }}
              hook="coverage-onboarding-learn-more"
              isExternal={true}
            >
              learn more
            </A>{' '}
            about Codecov AI.
          </p>
        </Card.Content>
      </Card>
    </div>
  )
}

export default LearnMoreBlurb

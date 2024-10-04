import A from 'ui/A'
import { Card } from 'ui/Card'

function LearnMoreBlurb() {
  return (
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
          about coverage integration.
        </p>
      </Card.Content>
    </Card>
  )
}

export default LearnMoreBlurb

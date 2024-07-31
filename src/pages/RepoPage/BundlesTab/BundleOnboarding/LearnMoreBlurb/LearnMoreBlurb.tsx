import A from 'ui/A'
import { Card } from 'ui/Card'

function LearnMoreBlurb() {
  return (
    <Card>
      <Card.Content>
        <p>
          Visit our guide to{' '}
          <A
            to={{ pageName: 'bundleAnalysisDocs' }}
            hook="bundle-onboarding-learn-more"
            isExternal={true}
          >
            learn more
          </A>{' '}
          about Javascript bundle setup.
        </p>
      </Card.Content>
    </Card>
  )
}

export default LearnMoreBlurb

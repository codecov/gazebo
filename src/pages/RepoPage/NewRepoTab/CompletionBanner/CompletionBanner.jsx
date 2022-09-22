import { useParams } from 'react-router-dom'

import { providerFeedback } from 'shared/utils'
import A from 'ui/A'
import Banner from 'ui/Banner'

function CompletionBanner() {
  const { provider } = useParams()

  return (
    <Banner variant="plain">
      <div className="flex flex-col gap-6 text-sm">
        <p>
          &#127881; Once the steps are complete, you should see the coverage
          dashboard
        </p>
        <div className="flex gap-1">
          <span className="font-semibold">How was your set up experience?</span>
          Let us know in{' '}
          <A
            hook="feedback"
            href={providerFeedback(provider)}
            isExternal={true}
          >
            this issue
          </A>
          .
        </div>
      </div>
    </Banner>
  )
}

export default CompletionBanner

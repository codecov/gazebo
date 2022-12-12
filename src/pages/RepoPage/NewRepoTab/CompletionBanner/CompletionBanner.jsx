import config from 'config'

import A from 'ui/A'
import Banner from 'ui/Banner'

function CompletionBanner() {
  return (
    <Banner variant="plain">
      <div className="flex flex-col gap-6 text-sm">
        <p>
          &#127881; Once the steps are complete, you should see the coverage
          dashboard
        </p>
        {!config.IS_SELF_HOSTED && (
          <div className="flex gap-1">
            <span className="font-semibold">
              How was your set up experience?
            </span>
            Let us know in{' '}
            <A
              hook="feedback"
              to={{ pageName: 'repoConfigFeedback' }}
              isExternal={true}
            >
              this issue
            </A>
            .
          </div>
        )}
      </div>
    </Banner>
  )
}

export default CompletionBanner

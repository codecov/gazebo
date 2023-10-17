import { useParams } from 'react-router-dom'

import { useActivateFlagMeasurements } from 'services/repo'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

function TriggerSyncBanner() {
  const { provider, owner, repo } = useParams()
  const { mutate } = useActivateFlagMeasurements({ provider, owner, repo })

  const enableFlagAnalytics = () => {
    mutate({ provider, owner, repo })
  }

  return (
    <div className="py-4">
      <Banner variant="plain">
        <BannerHeading>
          <div className="flex items-center gap-2">
            <Icon name="information-circle" />
            <h2 className="font-semibold">
              You need to enable Flag analytics to see coverage data
            </h2>
          </div>
        </BannerHeading>
        <BannerContent>
          <div className="flex flex-col gap-4">
            <p>
              Flag analytics is disabled by default. Enable this feature below
              to see all your historical coverage data and coverage trend for
              each flag.
            </p>
            <div className="flex self-start">
              <Button
                hook="backfill-task"
                variant="primary"
                onClick={enableFlagAnalytics}
              >
                Enable flag analytics
              </Button>
            </div>
          </div>
        </BannerContent>
      </Banner>
    </div>
  )
}

export default TriggerSyncBanner

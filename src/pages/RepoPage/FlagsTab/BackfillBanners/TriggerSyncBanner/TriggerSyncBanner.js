import { useParams } from 'react-router-dom'

import { useActivateFlagMeasurements } from 'services/repo/hooks'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import Banner from 'ui/Banner'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

function TriggerSyncBanner() {
  const { provider, owner, repo } = useParams()
  const { mutate } = useActivateFlagMeasurements({ provider, owner, repo })
  const { data: user } = useUser()

  const enableFlagAnalytics = () => {
    mutate({ provider, owner, repo })
    trackSegmentEvent({
      event: 'Flags Analytics Enabled',
      data: {
        userId: user?.trackingMetadata?.ownerid,
        repoName: repo,
      },
    })
  }

  return (
    <div className="py-4">
      <Banner
        variant="plain"
        heading={
          <div className="flex gap-2 items-center">
            <Icon name="information-circle" />
            <h2 className="font-semibold">
              You need to enable Flag analytics to see coverage data
            </h2>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p>
            Flag analytics is disabled by default. Enable this feature below to
            see all your historical coverage data and coverage trend for each
            flag.
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
      </Banner>
    </div>
  )
}

export default TriggerSyncBanner

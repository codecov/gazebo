import { useParams } from 'react-router-dom'

import { MEASUREMENT_TYPE, useActivateMeasurements } from 'services/repo'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

type URLParams = {
  provider: string
  owner: string
  repo: string
}

function TriggerSyncBanner() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { mutate } = useActivateMeasurements({
    provider,
    owner,
    repo,
    measurementType: MEASUREMENT_TYPE.FLAG_COVERAGE,
  })

  return (
    <div className="py-4">
      <Banner variant="plain">
        <BannerHeading>
          <div className="flex items-center gap-2">
            <Icon name="informationCircle" />
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
                to={undefined}
                hook="backfill-task"
                variant="primary"
                onClick={() => mutate()}
                disabled={false}
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

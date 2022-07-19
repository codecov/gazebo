import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import {
  useActivateFlagMeasurements,
  useRepoBackfilled,
} from 'services/repo/hooks'
import Banner from 'ui/Banner'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

function BackfillBanner() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepoBackfilled({ provider, owner, repo })
  const { mutate } = useActivateFlagMeasurements({ provider, owner, repo })

  return data && !data?.flagsMeasurementsActive ? (
    <Banner
      variant="plain"
      title={
        <div className="flex gap-2 items-center">
          <Icon name="information-circle" />
          <h2>You need to enable Flag analytics to see coverage data</h2>
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
            onClick={() => mutate({ provider, owner, repo })}
          >
            Enable flag analytics
          </Button>
        </div>
      </div>
    </Banner>
  ) : null
}

export default BackfillBanner

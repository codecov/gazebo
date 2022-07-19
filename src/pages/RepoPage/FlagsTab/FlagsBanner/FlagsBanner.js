import isEmpty from 'lodash/isEmpty'
import { useParams } from 'react-router-dom'

import {
  useActivateFlagMeasurements,
  useRepoBackfilled,
} from 'services/repo/hooks'
import Banner from 'ui/Banner'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

function FlagsBanner() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepoBackfilled({ provider, owner, repo })

  if (isEmpty(data)) return null

  return !data?.flagsMeasurementsActive ? (
    <BackfillBanner />
  ) : data?.flagsMeasurementsActive && !data?.flagsMeasurementsBackfilled ? (
    <SyncingBanner />
  ) : null
}

function BackfillBanner() {
  const { provider, owner, repo } = useParams()
  const { mutate } = useActivateFlagMeasurements({ provider, owner, repo })

  return (
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
  )
}

function SyncingBanner() {
  return (
    <Banner
      variant="plain"
      title={
        <div className="flex gap-2 items-center">
          <Icon name="information-circle" />
          <h2>Pulling historical data</h2>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p>
          We are pulling in all of your historical flags data, this can
          sometimes take awhile. This page will update once complete, feel free
          to navigate away in the meantime.
        </p>
      </div>
    </Banner>
  )
}

export default FlagsBanner

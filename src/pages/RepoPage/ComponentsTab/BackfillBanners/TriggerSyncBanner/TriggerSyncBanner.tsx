import { useParams } from 'react-router-dom'

import { MEASUREMENT_TYPE, useActivateMeasurements } from 'services/repo'
import Button from 'ui/Button'

import { LoadingTable } from '../../subroute/ComponentsTable/ComponentsTable'

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
    measurementType: MEASUREMENT_TYPE.COMPONENT_COVERAGE,
  })

  return (
    <div className="grid gap-4 pt-4">
      <LoadingTable></LoadingTable>
      <div className="flex flex-col items-center gap-1">
        <p>No data to display</p>
        <p>You will need to enable components to see related coverage data.</p>
      </div>
      <div className="flex flex-col items-center">
        <Button
          to={undefined}
          hook="backfill-task"
          variant="primary"
          onClick={mutate}
          disabled={false}
        >
          Enable component analytics
        </Button>
      </div>
    </div>
  )
}

export default TriggerSyncBanner

import { render, screen } from 'custom-testing-library'

import BackfillBanner from './BackfillBanner'
import { useRepoBackfillingStatus } from './hooks'

jest.mock('./TriggerSyncBanner', () => () => 'TriggerSyncBanner')
jest.mock('./SyncingBanner', () => () => 'SyncingBanner')

jest.mock('./hooks')

describe('BackfillBanner', () => {
  function setup(data) {
    useRepoBackfillingStatus.mockReturnValue(data)

    render(<BackfillBanner />)
  }

  describe('when rendered', () => {
    describe('when flags are not backfilled', () => {
      it('displays TriggerSyncBanner component', () => {
        setup({
          flagsMeasurementsActive: false,
          isRepoBackfilling: false,
        })
        expect(screen.getByText(/TriggerSyncBanner/)).toBeInTheDocument()
      })
    })
    describe('when flags are backfilling', () => {
      it('displays SyncingBanner component', () => {
        setup({
          flagsMeasurementsActive: true,
          isRepoBackfilling: true,
        })
        expect(screen.getByText(/SyncingBanner/)).toBeInTheDocument()
      })
    })
  })
})

import { render, screen } from 'custom-testing-library'

import BackfillBanners from './BackfillBanners'
import { useRepoBackfillingStatus } from './hooks'

jest.mock('./TriggerSyncBanner', () => () => 'TriggerSyncBanner')
jest.mock('./SyncingBanner', () => () => 'SyncingBanner')

jest.mock('./hooks')

describe('BackfillBanner', () => {
  function setup(data) {
    // TODO: when updating this to fetch components, add mock for BackfillComponentMemberships query
    useRepoBackfillingStatus.mockReturnValue(data)
  }

  describe('when rendered', () => {
    describe('when components are not backfilled', () => {
      it('displays TriggerSyncBanner component', () => {
        setup({
          componentsMeasurementsActive: false,
          isRepoBackfilling: false,
        })
        render(<BackfillBanners />)
        const triggerSyncBanner = screen.getByText(/TriggerSyncBanner/)
        expect(triggerSyncBanner).toBeInTheDocument()
      })
    })
    describe('when components are backfilling', () => {
      it('displays SyncingBanner component', () => {
        setup({
          componentsMeasurementsActive: true,
          isRepoBackfilling: true,
        })
        render(<BackfillBanners />)
        const syncingBanner = screen.getByText(/SyncingBanner/)
        expect(syncingBanner).toBeInTheDocument()
      })
    })
  })
})

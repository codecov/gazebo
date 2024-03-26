import { render, screen } from 'custom-testing-library'

import BackfillBanners from './BackfillBanners'
import { useRepoBackfillingStatus } from './hooks'

jest.mock('./TriggerSyncBanner', () => () => 'TriggerSyncBanner')
jest.mock('./SyncingBanner', () => () => 'SyncingBanner')

jest.mock('./hooks')

describe('BackfillBanner', () => {
  function setup(data) {
    useRepoBackfillingStatus.mockReturnValue(data)

    render(<BackfillBanners />)
  }

  describe('when rendered', () => {
    describe('when components are not backfilled', () => {
      it('displays TriggerSyncBanner component', () => {
        setup({
          componentsMeasurementsActive: false,
          isRepoBackfilling: false,
        })
        expect(screen.getByText(/TriggerSyncBanner/)).toBeInTheDocument()
      })
    })
    describe('when components are backfilling', () => {
      it('displays SyncingBanner component', () => {
        setup({
          componentsMeasurementsActive: true,
          isRepoBackfilling: true,
        })
        expect(screen.getByText(/SyncingBanner/)).toBeInTheDocument()
      })
    })
  })
})

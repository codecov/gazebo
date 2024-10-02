import { render, screen } from '@testing-library/react'

import BackfillBanners from './BackfillBanners'

const mocks = vi.hoisted(() => ({
  useRepoBackfillingStatus: vi.fn(),
}))

vi.mock('./useRepoBackfillingStatus', async () => {
  const actual = await vi.importActual('./useRepoBackfillingStatus')
  return {
    ...actual,
    useRepoBackfillingStatus: mocks.useRepoBackfillingStatus,
  }
})

vi.mock('./TriggerSyncBanner', () => ({ default: () => 'TriggerSyncBanner' }))
vi.mock('./SyncingBanner', () => ({ default: () => 'SyncingBanner' }))

describe('BackfillBanner', () => {
  function setup(data) {
    mocks.useRepoBackfillingStatus.mockReturnValue(data)

    render(<BackfillBanners />)
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

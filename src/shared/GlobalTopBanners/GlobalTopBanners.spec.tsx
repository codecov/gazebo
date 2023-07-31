import { render, screen } from '@testing-library/react'

import GlobalBanners from './GlobalTopBanners'

jest.mock('./TrialBanner', () => () => 'TrialBanner')

describe('GlobalBanners', () => {
  it('renders sentry trial banner', async () => {
    render(<GlobalBanners />)

    const banner = await screen.findByText('TrialBanner')
    expect(banner).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import GlobalBanners from './GlobalTopBanners'

jest.mock('./SentryTrialBanner', () => () => 'SentryTrialBanner')
jest.mock('./InstallationHelpBanner', () => () => 'InstallationHelpBanner')
jest.mock('./RequestInstallBanner', () => () => 'RequestInstallBanner')

const wrapper =
  ({
    initialEntries = '/bb/batman/batcave',
    path = '/:provider/:owner/:repo',
  }): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={path}>{children}</Route>
      </MemoryRouter>
    )

describe('GlobalBanners', () => {
  it('renders sentry trial banner', async () => {
    render(<GlobalBanners />, {
      wrapper: wrapper({
        initialEntries: '/bb/batman/batcave',
        path: '/:provider/:owner/:repo',
      }),
    })

    const banner = await screen.findByText('SentryTrialBanner')
    expect(banner).toBeInTheDocument()
  })

  it('renders request install help banner', async () => {
    render(<GlobalBanners />, {
      wrapper: wrapper({
        initialEntries: '/bb/batman',
        path: '/:provider/:owner',
      }),
    })

    const banner = await screen.findByText('RequestInstallBanner')
    expect(banner).toBeInTheDocument()
  })

  it('renders installation help banner', async () => {
    render(<GlobalBanners />, {
      wrapper: wrapper({
        initialEntries: '/bb',
        path: '/:provider',
      }),
    })

    const banner = await screen.findByText('InstallationHelpBanner')
    expect(banner).toBeInTheDocument()
  })
})

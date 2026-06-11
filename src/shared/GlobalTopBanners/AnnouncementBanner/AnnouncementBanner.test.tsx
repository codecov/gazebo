import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'
import { type Mock } from 'vitest'

import { useOwner } from 'services/user/useOwner'

import AnnouncementBanner from './AnnouncementBanner'

vi.mock('services/user/useOwner')

const mockedUseOwner = useOwner as Mock

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    mockedUseOwner.mockReturnValue({
      data: {
        isOnlyUsingSentryApp: false,
      },
    })
  })

  describe('when rendered with default copy', () => {
    it('renders banner text', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerText = await screen.findByText(/Codecov is joining Harness/)
      expect(bannerText).toBeInTheDocument()
    })

    it('renders the announcement link', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerLink = await screen.findByRole('link', { name: 'here' })
      expect(bannerLink).toBeInTheDocument()
      expect(bannerLink).toHaveAttribute(
        'href',
        'https://about.codecov.io/blog/a-new-chapter-for-codecov/'
      )
    })
  })

  describe('when rendered for Sentry GitHub app users', () => {
    beforeEach(() => {
      mockedUseOwner.mockReturnValue({
        data: {
          isOnlyUsingSentryApp: true,
        },
      })
    })

    it('renders the migration banner text', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerText = await screen.findByText(
        /You are currently using the Sentry GitHub app and need to migrate/
      )
      expect(bannerText).toBeInTheDocument()
    })

    it('renders the announcement link', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerLink = await screen.findByRole('link', {
        name: /part of Harness/,
      })

      expect(bannerLink).toBeInTheDocument()
      expect(bannerLink).toHaveAttribute(
        'href',
        'https://about.codecov.io/blog/a-new-chapter-for-codecov/'
      )
    })

    it('renders the Codecov GitHub app link', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerLink = await screen.findByRole('link', {
        name: /Codecov GitHub app/,
      })

      expect(bannerLink).toBeInTheDocument()
      expect(bannerLink).toHaveAttribute(
        'href',
        'https://github.com/apps/codecov'
      )
    })
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router'

import AnnouncementBanner from './AnnouncementBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('AnnouncementBanner', () => {
  describe('when rendered', () => {
    it('renders banner text', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerText = await screen.findByText(/Codecov is joining/)
      expect(bannerText).toBeInTheDocument()
    })
    it('renders the correct link', async () => {
      render(<AnnouncementBanner />, { wrapper })
      const bannerLink = await screen.findByRole('link', { name: 'here' })
      expect(bannerLink).toBeInTheDocument()
    })
  })
})

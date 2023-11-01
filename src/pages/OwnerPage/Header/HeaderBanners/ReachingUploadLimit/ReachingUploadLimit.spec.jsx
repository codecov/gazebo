import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ReachingUploadLimit from './ReachingUploadLimit'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ReachingUploadLimit', () => {
  describe('rendering banner', () => {
    it('has header content', () => {
      render(
        <ReachingUploadLimit planName="some-name" monthlyUploadLimit={341} />,
        { wrapper }
      )

      const heading = screen.getByText('Upload limit almost reached')
      expect(heading).toBeInTheDocument()
    })

    it('has body content', () => {
      render(
        <ReachingUploadLimit planName="some-name" monthlyUploadLimit={341} />,
        { wrapper }
      )

      const body = screen.getByText(/This org is currently/)
      expect(body).toBeInTheDocument()
    })

    it('has the correct plan name', () => {
      render(
        <ReachingUploadLimit planName="some-name" monthlyUploadLimit={341} />,
        { wrapper }
      )
      const body = screen.getByText(/some-name/)
      expect(body).toBeInTheDocument()
    })

    it('has the correct upload limit', () => {
      render(
        <ReachingUploadLimit planName="some-name" monthlyUploadLimit={341} />,
        { wrapper }
      )
      const body = screen.getByText(/includes 341 free uploads/)
      expect(body).toBeInTheDocument()
    })

    it('has links to upgrade org plan', () => {
      render(
        <ReachingUploadLimit planName="some-name" monthlyUploadLimit={341} />,
        { wrapper }
      )

      const links = screen.getAllByRole('link', { name: /upgrade plan/i })
      expect(links.length).toBe(2)
      expect(links[0]).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('has link to email sales team', () => {
      render(
        <ReachingUploadLimit planName="some-name" monthlyUploadLimit={341} />,
        { wrapper }
      )

      const link = screen.getByRole('link', { name: /sales@codecov.io/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io/sales')
    })
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ExceededUploadsAlert from './ExceededUploadsAlert'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ExceededUploadsAlert', () => {
  describe('rendering banner', () => {
    it('has header content', () => {
      render(
        <ExceededUploadsAlert planName="some-name" monthlyUploadLimit={200} />,
        { wrapper }
      )
      const heading = screen.getByText('Upload limit has been reached')
      expect(heading).toBeInTheDocument()
    })

    it('has body content', () => {
      render(
        <ExceededUploadsAlert planName="some-name" monthlyUploadLimit={200} />,
        { wrapper }
      )
      const body = screen.getByText(/This org is currently/)
      expect(body).toBeInTheDocument()
    })

    it('has the correct plan name', () => {
      render(
        <ExceededUploadsAlert planName="some-name" monthlyUploadLimit={200} />,
        { wrapper }
      )
      const body = screen.getByText(/some-name/)
      expect(body).toBeInTheDocument()
    })

    it('has the correct upload limit', () => {
      render(
        <ExceededUploadsAlert planName="some-name" monthlyUploadLimit={200} />,
        { wrapper }
      )
      const body = screen.getByText(/includes 200 free uploads/)
      expect(body).toBeInTheDocument()
    })

    it('has links to upgrade org plan', () => {
      render(
        <ExceededUploadsAlert planName="some-name" monthlyUploadLimit={200} />,
        { wrapper }
      )
      const links = screen.getAllByRole('link', { name: /upgrade plan/i })
      expect(links.length).toBe(2)
      expect(links[0]).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('has link to email sales team', () => {
      render(
        <ExceededUploadsAlert planName="some-name" monthlyUploadLimit={200} />,
        { wrapper }
      )
      const link = screen.getByRole('link', { name: /sales@codecov.io/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io/sales')
    })
  })
})

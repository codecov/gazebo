import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import SyncButton from './SyncButton'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/sync']}>
    <Route path="/sync">{children}</Route>
  </MemoryRouter>
)

describe('SyncButton', () => {
  describe('provider is set to gh', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="gh" />, { wrapper })

      const link = screen.getByRole('link', { name: /Sync with Github/ })

      const expectedRedirect = encodeURIComponent('http://localhost/gh')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/login/gh?to=${expectedRedirect}`)
    })
  })

  describe('provider is set to gl', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="gl" />, { wrapper })

      const link = screen.getByRole('link', { name: /Sync with Gitlab/ })

      const expectedRedirect = encodeURIComponent('http://localhost/gl')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/login/gl?to=${expectedRedirect}`)
    })
  })

  describe('provider is set to bb', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="bb" />, { wrapper })

      const link = screen.getByRole('link', { name: /Sync with BitBucket/ })

      const expectedRedirect = encodeURIComponent('http://localhost/bb')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/login/bb?to=${expectedRedirect}`)
    })
  })

  describe('provider is set to ghe', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="ghe" />, { wrapper })

      const link = screen.getByRole('link', {
        name: /Sync with Github Enterprise/,
      })

      const expectedRedirect = encodeURIComponent('http://localhost/ghe')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/login/ghe?to=${expectedRedirect}`)
    })
  })

  describe('provider is set to gle', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="gle" />, { wrapper })

      const link = screen.getByRole('link', {
        name: /Sync with Gitlab Enterprise/,
      })

      const expectedRedirect = encodeURIComponent('http://localhost/gle')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/login/gle?to=${expectedRedirect}`)
    })
  })

  describe('provider is set to bbs', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="bbs" />, { wrapper })

      const link = screen.getByRole('link', {
        name: /Sync with BitBucket Server/,
      })

      const expectedRedirect = encodeURIComponent('http://localhost/bbs')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/login/bbs?to=${expectedRedirect}`)
    })
  })
})

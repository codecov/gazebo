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

      const text = screen.getByText('Sync with Github')
      expect(text).toBeInTheDocument()
    })
  })

  describe('provider is set to gl', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="gl" />, { wrapper })

      const text = screen.getByText('Sync with Gitlab')
      expect(text).toBeInTheDocument()
    })
  })

  describe('provider is set to bb', () => {
    it('renders sync button', () => {
      render(<SyncButton provider="bb" />, { wrapper })

      const text = screen.getByText('Sync with BitBucket')
      expect(text).toBeInTheDocument()
    })
  })
})

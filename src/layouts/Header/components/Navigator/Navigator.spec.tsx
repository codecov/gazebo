import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Navigator from './Navigator'

jest.mock('ui/Breadcrumb', () => () => 'Breadcrumb')

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner" exact>
          {children}
        </Route>
        <Route path="/:provider/:owner/:repo" exact>
          {children}
        </Route>
      </MemoryRouter>
    )

describe('Header Navigator', () => {
  describe('when on repo page', () => {
    it('should render repo breadcrumb', async () => {
      render(<Navigator />, { wrapper: wrapper('/gh/codecov/test-repo') })

      const breadcrumb = await screen.findByText('Breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
    })
  })

  describe('temp: when not on repo page', () => {
    it('should render MyContextSwitcher', async () => {
      render(<Navigator />, { wrapper: wrapper() })

      const switcher = await screen.findByText('MyContextSwitcher')
      expect(switcher).toBeInTheDocument()
    })
  })
})

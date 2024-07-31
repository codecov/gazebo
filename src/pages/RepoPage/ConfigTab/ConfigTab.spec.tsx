import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwner } from 'services/user'

import ConfigTab from './ConfigTab'

jest.mock('services/user')
const mockedUseOwner = useOwner as jest.Mock

jest.mock('./tabs/ConfigurationManager', () => () => 'Configuration Manager')

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov/codecov-client/config') =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner/:repo/config">{children}</Route>
    </MemoryRouter>
  )

interface SetupArgs {
  isCurrentUserPartOfOrg?: boolean
}

describe('ConfigTab', () => {
  function setup({ isCurrentUserPartOfOrg = true }: SetupArgs) {
    mockedUseOwner.mockReturnValue({ data: { isCurrentUserPartOfOrg } })
  }

  describe('Render for a repo', () => {
    it('renders the right links', async () => {
      setup({})
      render(<ConfigTab />, { wrapper: wrapper() })

      expect(
        await screen.findByRole('link', { name: /General/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Configuration Manager/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Yaml/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Badge/ })
      ).toBeInTheDocument()
    })
  })

  describe('Render with an unknown path', () => {
    it('renders the right links', async () => {
      setup({})
      render(<ConfigTab />, {
        wrapper: wrapper('/gh/codecov/codecov-client/config/random'),
      })

      expect(
        await screen.findByRole('link', { name: /Configuration Manager/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /General/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Yaml/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Badge/ })
      ).toBeInTheDocument()
    })
  })

  describe('Render with user not part of org', () => {
    it('renders 404', async () => {
      setup({ isCurrentUserPartOfOrg: false })
      render(<ConfigTab />, { wrapper: wrapper() })

      expect(await screen.findByText('Error 404')).toBeInTheDocument()
    })
  })
})

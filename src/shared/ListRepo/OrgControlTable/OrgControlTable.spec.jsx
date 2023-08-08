import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { orderingOptions } from 'services/repos'

import OrgControlTable from './OrgControlTable'

jest.mock('./RepoOrgNotFound', () => () => 'RepoOrgNotFound')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('OrgControlTable', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }
  describe('when rendering with repo display set to active', () => {
    it('renders the active button selected', () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={jest.fn()}
          setRepoDisplay={jest.fn()}
          setSearchValue={jest.fn()}
          searchValue=""
          canRefetch={true}
          repoDisplay="Active"
        />,
        { wrapper }
      )

      const buttonEnabled = screen.getByRole('button', {
        name: /Active/,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Inactive/i,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).toHaveClass('bg-ds-primary-base')
      expect(buttonDisabled).not.toHaveClass('bg-ds-primary-base')
    })

    describe('when clicking on inactive button', () => {
      it('calls setRepoDisplay with false', async () => {
        const { user } = setup()
        const setRepoDisplay = jest.fn()
        render(
          <OrgControlTable
            sortItem={orderingOptions[0]}
            setSortItem={jest.fn()}
            repoDisplay="All"
            setRepoDisplay={setRepoDisplay}
            setSearchValue={jest.fn()}
            searchValue=""
            canRefetch={true}
          />,
          { wrapper }
        )

        const inactiveButton = screen.getByRole('button', { name: /Inactive/ })
        await user.click(inactiveButton)

        expect(setRepoDisplay).toHaveBeenCalledWith('Inactive')
      })
    })
  })

  describe('when rendering with repo display set to inactive', () => {
    it('renders the not yet active button selected', () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={jest.fn()}
          setRepoDisplay={jest.fn()}
          setSearchValue={jest.fn()}
          searchValue=""
          canRefetch={true}
          repoDisplay="Inactive"
        />,
        { wrapper }
      )

      const buttonEnabled = screen.getByRole('button', {
        name: /Active/,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Inactive/,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).not.toHaveClass('bg-ds-primary-base')
      expect(buttonDisabled).toHaveClass('bg-ds-primary-base')
    })

    describe('when clicking on Active button', () => {
      it('calls setActive with false', async () => {
        const { user } = setup()
        const setRepoDisplay = jest.fn()
        render(
          <OrgControlTable
            sortItem={orderingOptions[0]}
            setSortItem={jest.fn()}
            repoDisplay="All"
            setRepoDisplay={setRepoDisplay}
            setSearchValue={jest.fn()}
            searchValue=""
            canRefetch={true}
          />,
          { wrapper }
        )

        const activeButton = screen.getByRole('button', {
          name: /Active/,
        })

        await user.click(activeButton)

        expect(setRepoDisplay).toHaveBeenCalledWith('Active')
      })
    })
  })

  describe('when typing in the search', () => {
    it(`doesn't call setSearchValue yet`, async () => {
      const { user } = setup()
      const setSearchValue = jest.fn()
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={jest.fn()}
          repoDisplay="All"
          setRepoDisplay={jest.fn()}
          setSearchValue={setSearchValue}
          searchValue=""
          canRefetch={true}
        />,
        { wrapper }
      )

      const searchInput = screen.getByRole('textbox', {
        name: /search/i,
      })
      await user.type(searchInput, 'search')

      expect(setSearchValue).not.toHaveBeenCalledWith('search')
    })

    describe('after waiting some time', () => {
      it('calls setSearchValue', async () => {
        const { user } = setup()
        const setSearchValue = jest.fn()
        render(
          <OrgControlTable
            sortItem={orderingOptions[0]}
            setSortItem={jest.fn()}
            repoDisplay="All"
            setRepoDisplay={jest.fn()}
            setSearchValue={setSearchValue}
            searchValue=""
            canRefetch={true}
          />,
          { wrapper }
        )

        const searchInput = screen.getByRole('textbox', {
          name: /search/i,
        })
        await user.type(searchInput, 'search')

        await waitFor(() => expect(setSearchValue).toHaveBeenCalled())
      })
    })
  })

  describe('when the user can refetch', () => {
    it('renders the RepoOrgNotFound', () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={jest.fn()}
          repoDisplay="All"
          setRepoDisplay={jest.fn()}
          setSearchValue={jest.fn()}
          searchValue=""
          canRefetch={true}
        />,
        { wrapper }
      )
      expect(screen.getByText(/RepoOrgNotFound/)).toBeInTheDocument()
    })
  })

  describe('when the user cant refetch', () => {
    it(`doesn't render the RepoOrgNotFound`, () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={jest.fn()}
          repoDisplay="All"
          setRepoDisplay={jest.fn()}
          setSearchValue={jest.fn()}
          searchValue=""
          canRefetch={false}
        />,
        { wrapper }
      )

      expect(screen.queryByText(/RepoOrgNotFound/)).not.toBeInTheDocument()
    })
  })
})

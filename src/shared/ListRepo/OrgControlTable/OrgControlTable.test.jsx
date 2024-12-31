import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { orderingOptions } from 'services/repos/config'

import OrgControlTable from './OrgControlTable'

vi.mock('./RepoOrgNotFound', () => ({ default: () => 'RepoOrgNotFound' }))

describe('OrgControlTable', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }
  describe('when rendering with repo display set to "Configured"', () => {
    it('renders the "Configured" button selected', () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={vi.fn()}
          setRepoDisplay={vi.fn()}
          setSearchValue={vi.fn()}
          searchValue=""
          canRefetch={true}
          repoDisplay="Configured"
        />
      )

      const buttonEnabled = screen.getByRole('button', {
        name: 'Configured',
        exact: true,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Not Configured/,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).toHaveClass('bg-ds-primary-base')
      expect(buttonDisabled).not.toHaveClass('bg-ds-primary-base')
    })

    describe('when clicking on "Not Configured" button', () => {
      it('calls setRepoDisplay with false', async () => {
        const { user } = setup()
        const setRepoDisplay = vi.fn()
        render(
          <OrgControlTable
            sortItem={orderingOptions[0]}
            setSortItem={vi.fn()}
            repoDisplay="All"
            setRepoDisplay={setRepoDisplay}
            setSearchValue={vi.fn()}
            searchValue=""
            canRefetch={true}
          />
        )

        const inactiveButton = screen.getByRole('button', {
          name: /Not Configured/,
        })
        await user.click(inactiveButton)

        expect(setRepoDisplay).toHaveBeenCalledWith('Not Configured')
      })
    })
  })

  describe('when rendering with repo display set to "Not Configured"', () => {
    it('renders the "Not Configured" button selected', () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={vi.fn()}
          setRepoDisplay={vi.fn()}
          setSearchValue={vi.fn()}
          searchValue=""
          canRefetch={true}
          repoDisplay="Not Configured"
        />
      )

      const buttonEnabled = screen.getByRole('button', {
        name: 'Configured',
        exact: true,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Not Configured/,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).not.toHaveClass('bg-ds-primary-base')
      expect(buttonDisabled).toHaveClass('bg-ds-primary-base')
    })

    describe('when clicking on "Configured" button', () => {
      it('calls setActive with false', async () => {
        const { user } = setup()
        const setRepoDisplay = vi.fn()
        render(
          <OrgControlTable
            sortItem={orderingOptions[0]}
            setSortItem={vi.fn()}
            repoDisplay="All"
            setRepoDisplay={setRepoDisplay}
            setSearchValue={vi.fn()}
            searchValue=""
            canRefetch={true}
          />
        )

        const configuredButton = screen.getByRole('button', {
          name: 'Configured',
          exact: true,
        })

        await user.click(configuredButton)

        expect(setRepoDisplay).toHaveBeenCalledWith('Configured')
      })
    })
  })

  describe('when typing in the search', () => {
    it(`doesn't call setSearchValue yet`, async () => {
      const { user } = setup()
      const setSearchValue = vi.fn()
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={vi.fn()}
          repoDisplay="All"
          setRepoDisplay={vi.fn()}
          setSearchValue={setSearchValue}
          searchValue=""
          canRefetch={true}
        />
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
        const setSearchValue = vi.fn()
        render(
          <OrgControlTable
            sortItem={orderingOptions[0]}
            setSortItem={vi.fn()}
            repoDisplay="All"
            setRepoDisplay={vi.fn()}
            setSearchValue={setSearchValue}
            searchValue=""
            canRefetch={true}
          />
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
          setSortItem={vi.fn()}
          repoDisplay="All"
          setRepoDisplay={vi.fn()}
          setSearchValue={vi.fn()}
          searchValue=""
          canRefetch={true}
        />
      )
      expect(screen.getByText(/RepoOrgNotFound/)).toBeInTheDocument()
    })
  })

  describe('when the user cant refetch', () => {
    it(`doesn't render the RepoOrgNotFound`, () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={vi.fn()}
          repoDisplay="All"
          setRepoDisplay={vi.fn()}
          setSearchValue={vi.fn()}
          searchValue=""
          canRefetch={false}
        />
      )

      expect(screen.queryByText(/RepoOrgNotFound/)).not.toBeInTheDocument()
    })
  })

  describe('when show team plan passed in', () => {
    it('does not render the ordering select', () => {
      render(
        <OrgControlTable
          sortItem={orderingOptions[0]}
          setSortItem={vi.fn()}
          repoDisplay="All"
          setRepoDisplay={vi.fn()}
          setSearchValue={vi.fn()}
          searchValue=""
          canRefetch={false}
          showTeamRepos={true}
        />
      )

      const select = screen.queryByRole('combobox', {
        name: /Sort Order/i,
      })
      expect(select).not.toBeInTheDocument()
    })
  })
})

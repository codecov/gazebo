import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { orderingOptions } from 'services/repos'

import OrgControlTable from './OrgControlTable'

jest.mock('./GithubPrivateScopeLogin', () => () => 'GithubPrivateScopeLogin')
jest.mock('./ResyncButton', () => () => 'ResyncButton')

describe('OrgControlTable', () => {
  let props

  function setup(over = {}) {
    props = {
      sortItem: orderingOptions[0],
      setSortItem: jest.fn(),
      repoDisplay: 'All',
      setRepoDisplay: jest.fn(),
      setSearchValue: jest.fn(),
      searchValue: '',
      canRefetch: true,
      ...over,
    }
    render(<OrgControlTable {...props} />)
  }

  describe('when rendering with repo display set to active', () => {
    beforeEach(() => {
      setup({
        repoDisplay: 'Active',
      })
    })

    it('renders the active button selected', () => {
      const buttonEnabled = screen.getByRole('button', {
        name: /Active/,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Inactive/i,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).toHaveClass('bg-ds-blue-darker')
      expect(buttonDisabled).not.toHaveClass('bg-ds-blue-darker')
    })

    describe('when clicking on inactive button', () => {
      beforeEach(() => {
        screen
          .getByRole('button', {
            name: /Inactive/,
          })
          .click()
      })

      it('calls setRepoDisplay with false', () => {
        expect(props.setRepoDisplay).toHaveBeenCalledWith('Inactive')
      })
    })
  })

  describe('when rendering with repo display set to inactive', () => {
    beforeEach(() => {
      setup({
        repoDisplay: 'Inactive',
      })
    })

    it('renders the not yet active button selected', () => {
      const buttonEnabled = screen.getByRole('button', {
        name: /Active/,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Inactive/,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).not.toHaveClass('bg-ds-blue-darker')
      expect(buttonDisabled).toHaveClass('bg-ds-blue-darker')
    })

    describe('when clicking on Active button', () => {
      beforeEach(() => {
        screen
          .getByRole('button', {
            name: /Active/,
          })
          .click()
      })

      it('calls setActive with false', () => {
        expect(props.setRepoDisplay).toHaveBeenCalledWith('Active')
      })
    })
  })

  describe('when typing in the search', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      setup()
      const searchInput = screen.getByRole('textbox', {
        name: /search/i,
      })
      userEvent.type(searchInput, 'search')
    })

    it('doesnt call setSearchValue yet', () => {
      expect(props.setSearchValue).not.toHaveBeenCalledWith('search')
    })

    describe('after waiting some time', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(600)
      })

      it('calls setSearchValue', () => {
        expect(props.setSearchValue).toHaveBeenCalled()
      })
    })
  })

  describe('when the user can refetch', () => {
    beforeEach(() => {
      setup({
        canRefetch: true,
      })
    })

    it('renders the ResyncButton', () => {
      expect(screen.getByText(/ResyncButton/)).toBeInTheDocument()
    })
  })

  describe('when the user cant refetch', () => {
    beforeEach(() => {
      setup({
        canRefetch: false,
      })
    })

    it('doesnt render the ResyncButton', () => {
      expect(screen.queryByText(/ResyncButton/)).not.toBeInTheDocument()
    })
  })
})

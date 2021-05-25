import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { orderingOptions } from 'services/repos'

import OrgControlTable from './OrgControlTable'

jest.mock('./ResyncButton', () => () => 'ResyncButton')

describe('OrgControlTable', () => {
  let props

  function setup(over = {}) {
    props = {
      sortItem: orderingOptions[0],
      setSortItem: jest.fn(),
      active: true,
      setActive: jest.fn(),
      setSearchValue: jest.fn(),
      ...over,
    }
    render(<OrgControlTable {...props} />)
  }

  describe('when rendering with active true', () => {
    beforeEach(() => {
      setup({
        active: true,
      })
    })

    it('renders the active button selected', () => {
      const buttonEnabled = screen.getByRole('button', {
        name: /enabled/i,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Not yet setup/i,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).toHaveClass('bg-ds-blue-darker')
      expect(buttonDisabled).not.toHaveClass('bg-ds-blue-darker')
    })

    describe('when clicking on not yet setup button', () => {
      beforeEach(() => {
        screen
          .getByRole('button', {
            name: /Not yet setup/i,
          })
          .click()
      })

      it('calls setActive with false', () => {
        expect(props.setActive).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('when rendering with active false', () => {
    beforeEach(() => {
      setup({
        active: false,
      })
    })

    it('renders the not yet active button selected', () => {
      const buttonEnabled = screen.getByRole('button', {
        name: /enabled/i,
      })
      const buttonDisabled = screen.getByRole('button', {
        name: /Not yet setup/i,
      })
      // no better way to assert the button is selected yet
      expect(buttonEnabled).not.toHaveClass('bg-ds-blue-darker')
      expect(buttonDisabled).toHaveClass('bg-ds-blue-darker')
    })

    describe('when clicking on enabled button', () => {
      beforeEach(() => {
        screen
          .getByRole('button', {
            name: /enabled/i,
          })
          .click()
      })

      it('calls setActive with false', () => {
        expect(props.setActive).toHaveBeenCalledWith(true)
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
})

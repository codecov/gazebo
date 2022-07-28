import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SearchField from './SearchField'

describe('SearchField', () => {
  let props

  function setup(over = {}) {
    props = {
      searchValue: '',
      setSearchValue: jest.fn(),
      placeholder: 'Search',
      ...over,
    }
    render(<SearchField {...props} />)
  }

  describe('Basic', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      setup()
      const searchField = screen.getByRole('textbox', {
        name: 'Search',
      })
      userEvent.type(searchField, 'file.js')
    })

    describe('when typing in the search field', () => {
      it('waits to call setSearchValue', () => {
        expect(props.setSearchValue).not.toHaveBeenCalledWith('file.js')
      })
    })

    describe('after waiting for debounce', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(1000)
      })

      it('calls setSearchValue', () => {
        expect(props.setSearchValue).toHaveBeenCalled()
      })
    })
  })

  describe('custom onChange', () => {
    let onChangeMock = jest.fn()
    beforeEach(() => {
      jest.useFakeTimers()
      setup({ onChange: onChangeMock })
      const searchField = screen.getByRole('textbox', {
        name: 'Search',
      })
      userEvent.type(searchField, 'file.js')
    })

    it('fired the custom onChangehandler', () => {
      expect(onChangeMock).toHaveBeenCalled()
    })
  })
})

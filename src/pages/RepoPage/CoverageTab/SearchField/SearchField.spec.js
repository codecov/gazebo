import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SearchField from './SearchField'

describe('SearchField', () => {
  let props

  function setup(over = {}) {
    props = {
      searchValue: '',
      setSearchValue: jest.fn(),
    }
    render(<SearchField {...props} />)
  }

  beforeEach(() => {
    jest.useFakeTimers()
    setup()
    const searchField = screen.getByRole('textbox', {
      name: 'Search for files',
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

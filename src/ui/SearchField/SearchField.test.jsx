import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SearchField from './SearchField'

describe('SearchField', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('Basic', () => {
    describe('when typing in the search field', () => {
      it('waits to call setSearchValue', async () => {
        const setSearchValue = vi.fn()
        const { user } = setup()
        render(
          <SearchField
            searchValue=""
            setSearchValue={setSearchValue}
            placeholder="Search"
            dataMarketing="marketing"
          />
        )

        const searchField = screen.getByRole('textbox', {
          name: 'Search',
        })

        await user.click(searchField)
        await user.keyboard('file.js')

        expect(setSearchValue).not.toHaveBeenCalledWith('file.js')
      })
    })

    describe('after waiting for debounce', () => {
      it('calls setSearchValue', async () => {
        const setSearchValue = vi.fn()
        const { user } = setup()
        render(
          <SearchField
            searchValue=""
            setSearchValue={setSearchValue}
            placeholder="Search"
            dataMarketing="marketing"
          />
        )

        const searchField = screen.getByRole('textbox', {
          name: 'Search',
        })

        await user.click(searchField)
        await user.keyboard('file.js')

        await waitFor(() => expect(setSearchValue).toHaveBeenCalled())
      })
    })
  })

  describe('custom onChange', () => {
    it('fired the custom onChange', async () => {
      const onChange = vi.fn()
      const setSearchValue = vi.fn()
      const { user } = setup()
      render(
        <SearchField
          searchValue=""
          setSearchValue={setSearchValue}
          onChange={onChange}
          placeholder="Search"
          dataMarketing="marketing"
        />
      )

      const searchField = screen.getByRole('textbox', {
        name: 'Search',
      })

      await user.click(searchField)
      await user.keyboard('file.js')

      expect(onChange).toHaveBeenCalled()
    })
  })
})

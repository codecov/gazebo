import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrgControlTable from './OrgControlTable'

vi.mock('./RepoOrgNotFound', () => ({ default: () => 'RepoOrgNotFound' }))

describe('OrgControlTable', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('when typing in the search', () => {
    it(`doesn't call setSearchValue yet`, async () => {
      const { user } = setup()
      const setSearchValue = vi.fn()
      render(<OrgControlTable setSearchValue={setSearchValue} searchValue="" />)

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
          <OrgControlTable setSearchValue={setSearchValue} searchValue="" />
        )

        const searchInput = screen.getByRole('textbox', {
          name: /search/i,
        })
        await user.type(searchInput, 'search')

        await waitFor(() => expect(setSearchValue).toHaveBeenCalled())
      })
    })
  })

  describe('when show team plan passed in', () => {
    it('does not render the ordering select', () => {
      render(<OrgControlTable setSearchValue={vi.fn()} searchValue="" />)

      const select = screen.queryByRole('combobox', {
        name: /Sort Order/i,
      })
      expect(select).not.toBeInTheDocument()
    })
  })
})

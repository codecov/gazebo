import { render, screen } from '@testing-library/react'
import Patch from '.'

describe('Patch', () => {
  function setup({ commit }) {
    render(<Patch commit={commit} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        commit: {
          author: { username: 'RulaKhaled' },
          compareWithParent: {
            patchTotals: {
              coverage: 90,
            },
          },
          totals: {
            coverage: 45,
          },
          parent: {
            totals: {
              coverage: 98,
            },
          },
          commitid: '123456789',
          message: 'Test1',
          createdAt: '2021-08-30T19:33:49.819672',
        },
      })
    })

    it('renders commit patch', () => {
      const change = screen.getByText(/9000.00%/)
      expect(change).toBeInTheDocument()
    })
  })
})

import { render, screen } from '@testing-library/react'
import Change from '.'

describe('Change', () => {
  function setup({ commit }) {
    render(<Change commit={commit} />)
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

    it('renders commit change', () => {
      const change = screen.getByText(/-53.00%/)
      expect(change).toBeInTheDocument()
    })
  })
})

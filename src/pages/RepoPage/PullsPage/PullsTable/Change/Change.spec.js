import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Change from '.'

jest.mock('services/repo/hooks')

describe('Change', () => {
  function setup({ pull }) {
    render(
      <MemoryRouter>
        <Change pull={pull} />
      </MemoryRouter>
    )
  }

  describe('when rendered with a pull with coverage', () => {
    setup({
      pull: {
        author: { username: 'RulaKhaled' },
        compareWithBase: {
          patchTotals: {
            coverage: 90,
          },
        },
        head: {
          totals: {
            coverage: 45,
          },
        },
        pullId: 746,
        state: 'MERGED',
        title: 'Test1',
        updatestamp: '2021-08-30T19:33:49.819672',
      },
    })

    it('renders pulls change from base', () => {
      const change = screen.getByText(/90%/)
      expect(change).toBeInTheDocument()
    })
  })

  describe('when rendered with no pull', () => {
    setup({
      pull: null,
    })

    it('renders nothing', () => {
      const change = screen.queryByText(/90%/)
      expect(change).not.toBeInTheDocument()
    })
  })
})

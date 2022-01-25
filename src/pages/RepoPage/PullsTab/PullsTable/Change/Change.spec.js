import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Change from '.'

jest.mock('services/repo/hooks')

describe('Change', () => {
  function setup({ head, compareWithBase }) {
    render(
      <MemoryRouter>
        <Change head={head} compareWithBase={compareWithBase} />
      </MemoryRouter>
    )
  }

  describe('when rendered with a pull with coverage', () => {
    setup({
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

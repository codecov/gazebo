import { render, screen } from '@testing-library/react'
import Coverage from '.'
import { MemoryRouter } from 'react-router-dom'

describe('Coverage', () => {
  function setup({ commitid, totals }) {
    render(
      <MemoryRouter>
        <Coverage commitid={commitid} totals={totals} />
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        totals: {
          coverage: 45,
        },
        commitid: '123456789',
      })
    })

    it('renders commit coverage', () => {
      const coverage = screen.getByText(/45.00%/)
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no coverage', () => {
    beforeEach(() => {
      setup({
        totals: {
          coverage: null,
        },
        parent: {
          totals: {
            coverage: 98,
          },
        },
        commitid: '123456789',
      })
    })

    it('renders no report text', () => {
      const text = screen.getByText(/No report uploaded/)
      expect(text).toBeInTheDocument()
    })
  })
})

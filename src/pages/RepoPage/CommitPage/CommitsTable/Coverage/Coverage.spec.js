import { render, screen } from '@testing-library/react'
import Coverage from '.'
import { MemoryRouter } from 'react-router-dom'

describe('Coverage', () => {
  function setup({ commit }) {
    render(
      <MemoryRouter>
        <Coverage commit={commit} />
      </MemoryRouter>
    )
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
          commitid: '123456789',
          message: 'Test1',
          createdAt: '2021-08-30T19:33:49.819672',
        },
      })
    })

    it('renders commit id', () => {
      const id = screen.getByText(/12345678/)
      expect(id).toBeInTheDocument()
    })

    it('renders commit coverage', () => {
      const coverage = screen.getByText(/45.00%/)
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no coverage', () => {
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
            coverage: null,
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

    it('renders commit id', () => {
      const id = screen.getByText(/12345678/)
      expect(id).toBeInTheDocument()
    })

    it('renders no report text', () => {
      const text = screen.getByText(/No report uploaded/)
      expect(text).toBeInTheDocument()
    })
  })
})

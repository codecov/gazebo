import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Coverage from '.'

jest.mock('services/repo')

describe('Coverage', () => {
  function setup({ head, pullId, state }) {
    render(
      <MemoryRouter>
        <Coverage head={head} state={state} pullId={pullId} />
      </MemoryRouter>
    )
  }

  describe('when rendered with a pull coverage', () => {
    beforeEach(() => {
      setup({
        head: {
          totals: {
            percentCovered: 45,
          },
        },
        pullId: 746,
        state: 'MERGED',
      })
    })

    it('renders id of the pull', () => {
      const id = screen.getByText(/#746/)
      expect(id).toBeInTheDocument()
    })

    it('renders coverage of pull', () => {
      const coverage = screen.getByText(/45.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders coverage state', () => {
      const coverage = screen.getByText(/merge.svg/)
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no coverage in pull', () => {
    beforeEach(() => {
      setup({
        head: {
          totals: {
            coverage: null,
          },
        },
        pullId: 746,
        state: 'MERGED',
      })
    })

    it('renders id of the pull', () => {
      const id = screen.getByText(/#746/)
      expect(id).toBeInTheDocument()
    })

    it('renders no reports text', () => {
      const text = screen.getByText('No report uploaded yet')
      expect(text).toBeInTheDocument()
    })
  })
})

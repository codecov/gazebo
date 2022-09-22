import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Coverage from '.'

jest.mock('services/repo/hooks')

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
            coverage: 45,
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

    it('renders covergae of pull', () => {
      const covergae = screen.getByText(/45.00%/)
      expect(covergae).toBeInTheDocument()
    })

    it('renders covergae state', () => {
      const covergae = screen.getByText(/merge.svg/)
      expect(covergae).toBeInTheDocument()
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

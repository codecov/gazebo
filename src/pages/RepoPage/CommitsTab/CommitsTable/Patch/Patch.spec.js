import { render, screen } from '@testing-library/react'
import Patch from '.'

describe('Patch', () => {
  function setup({ compareWithParent }) {
    render(<Patch compareWithParent={compareWithParent} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        compareWithParent: {
          patchTotals: {
            coverage: 90,
          },
        },
      })
    })

    it('renders commit patch', () => {
      const change = screen.getByText(/90%/)
      expect(change).toBeInTheDocument()
    })
  })
})

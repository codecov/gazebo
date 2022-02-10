import { render, screen } from '@testing-library/react'
import Patch from '.'

describe('Patch', () => {
  function setup({ compareWithParent }) {
    render(<Patch compareWithParent={compareWithParent} />)
  }

  describe('when rendered', () => {
    it('renders commit patch when there is a valid value', () => {
      setup({compareWithParent: {
        patchTotals: {
          coverage: 90,
          },
        },
      })
      const patchValue = screen.getByTestId('patch-value')
      expect(patchValue).toHaveTextContent("90.00%")
    })

    it('renders ø when there is an invalid value', () => {
      setup({})
      const patchValue = screen.getByTestId('patch-value')
      expect(patchValue).toHaveTextContent("ø")
    })
  })
})

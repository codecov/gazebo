import { render, screen } from '@testing-library/react'

import Patch from '.'

describe('Patch', () => {
  function setup({ compareWithParent }) {
    render(<Patch compareWithParent={compareWithParent} />)
  }

  describe('when rendered', () => {
    it('renders commit patch when there is a valid value', () => {
      setup({
        compareWithParent: {
          patchTotals: {
            coverage: 0.9,
          },
        },
      })
      const patchValue = screen.getByTestId('patch-value')
      expect(patchValue).toHaveTextContent('90%')
    })

    it('renders - when there is an invalid value', () => {
      setup({})
      const patchValue = screen.getByTestId('patch-value')
      expect(patchValue).toHaveTextContent('-')
    })
  })
})

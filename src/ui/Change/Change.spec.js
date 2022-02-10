import { render, screen } from '@testing-library/react'
import Change from '.'

describe('Change', () => {
  function setup({value, variant="default"}) {
    render(<Change value={value} variant={variant} />)
  }

  describe('when rendered', () => {
    it('renders commit change when there is a valid value', () => {
      setup({value: 23})
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent("23.00%")
    })

    it('renders negative number when change is negative', () => {
      setup({value: -17})
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent("-17.00%")
    })

    it('renders ø when there is an invalid value', () => {
      setup({})
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent("ø")
    })

    it('renders ø when you get 0 change', () => {
      setup({value: 0})
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent("ø")
    })
  })
})

import { render, screen, fireEvent } from '@testing-library/react'

import Datepicker from './Datepicker'

describe('Datepicker', () => {
  function setup() {
    render(<Datepicker />)
  }

  describe('renders the DateRangePicker component', () => {
    beforeEach(setup)

    it('has a changeable start date', () => {
      const startDate = screen.getByRole('textbox', { name: 'Start Date' })
      expect(startDate.value).toBe('')
      fireEvent.change(startDate, { target: { value: '01/01/2021' } })
      expect(startDate.value).toBe('01/01/2021')
    })

    it('has a changeable end date', () => {
      const endDate = screen.getByRole('textbox', { name: 'End Date' })
      expect(endDate.value).toBe('')
      fireEvent.change(endDate, { target: { value: '10/01/2021' } })
      expect(endDate.value).toBe('10/01/2021')
    })
  })
})

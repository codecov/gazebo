import { fireEvent, render, screen } from '@testing-library/react'

import DateRangePicker from './DateRangePicker'

describe('DateRangePicker', () => {
  let props

  function setup({ params, updateParams }) {
    render(<DateRangePicker params={params} updateParams={updateParams} />)
  }

  describe('DateRangePicker component with start and end date', () => {
    beforeEach(() => {
      props = {
        params: {
          startDate: '10/02/2021',
          endDate: '12/05/2021',
        },
        updateParams: jest.fn(),
      }
      setup(props)
    })

    it('has a changeable start date', () => {
      const input = screen.getByDisplayValue('10/02/2021 - 12/05/2021')
      fireEvent.change(input, { target: { value: '10/02/2021 - 12/06/2021' } })
      expect(input.value).toBe('10/02/2021 - 12/06/2021')
    })

    it('renders an empty string for start and end date when value is changed to null', () => {
      const input = screen.getByDisplayValue('10/02/2021 - 12/05/2021')
      fireEvent.change(input, { target: { value: null } })
      expect(input.value).toBe('')
      expect(props.updateParams).toBeCalled()
    })
  })
})

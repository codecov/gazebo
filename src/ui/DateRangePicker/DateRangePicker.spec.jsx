import { fireEvent, render, screen } from '@testing-library/react'

import DateRangePicker from './DateRangePicker'

describe('DateRangePicker', () => {
  let props

  describe('DateRangePicker component with start and end date', () => {
    beforeEach(() => {
      props = {
        startDate: '10/02/2021',
        endDate: '12/05/2021',
        onChange: jest.fn(),
      }
    })

    it('has a changeable start date', async () => {
      render(<DateRangePicker {...props} />)

      const input = screen.getByDisplayValue('10/02/2021 - 12/05/2021')
      // I can't find a similar way to accomplish this event with userEvent
      // eslint-disable-next-line testing-library/prefer-user-event
      await fireEvent.change(input, {
        target: { value: '10/02/2021 - 12/06/2021' },
      })

      expect(input.value).toBe('10/02/2021 - 12/06/2021')
    })

    it('renders an empty string for start and end date when value is changed to null', async () => {
      render(<DateRangePicker {...props} />)

      const input = screen.getByDisplayValue('10/02/2021 - 12/05/2021')
      // I can't find a similar way to accomplish this event with userEvent
      // eslint-disable-next-line testing-library/prefer-user-event
      await fireEvent.change(input, { target: { value: null } })
      expect(input.value).toBe('')

      expect(props.onChange).toBeCalled()
    })
  })
})

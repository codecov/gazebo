/* eslint-disable testing-library/prefer-user-event */
/* eslint-disable testing-library/await-fire-event */
import { fireEvent, render, screen } from '@testing-library/react'

import RadioInput from './RadioInput'

describe('Radio', () => {
  describe('renders default radio input', () => {
    describe('label is a string', () => {
      it('renders default with label', async () => {
        render(<RadioInput label="This is the label" />)

        const label = await screen.findByText('This is the label')
        expect(label).toBeInTheDocument()
      })
    })

    describe('label is a react node', () => {
      it('renders label', async () => {
        render(
          <RadioInput
            label={<span className="font-semibold">This is the label</span>}
          />
        )

        const label = await screen.findByText('This is the label')
        expect(label).toBeInTheDocument()
        expect(label).toHaveClass('font-semibold')
      })
    })
  })

  describe('calls onChange function if', () => {
    it('radio button is clicked', async () => {
      const onChange = vi.fn()
      render(
        <RadioInput
          label={<span className="font-semibold">This is the label</span>}
          id="unique-id"
          onChange={onChange}
        />
      )

      const input = screen.getByLabelText('This is the label')
      fireEvent.click(input)
      expect(onChange).toHaveBeenCalled()
    })

    it('label is clicked', async () => {
      const onChange = vi.fn()
      render(
        <RadioInput
          label={<span className="font-semibold">This is the label</span>}
          id="unique-id"
          onChange={onChange}
        />
      )

      const label = await screen.findByText('This is the label')
      fireEvent.click(label)
      expect(onChange).toHaveBeenCalled()
    })
  })
})

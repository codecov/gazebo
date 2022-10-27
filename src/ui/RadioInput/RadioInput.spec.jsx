import { render, screen } from '@testing-library/react'

import RadioInput from './RadioInput'

describe('Radio', () => {
  describe('renders default radio input', () => {
    describe('label is a string', () => {
      it('renders default with label', async () => {
        render(<RadioInput label={'This is the label'} />)
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
})

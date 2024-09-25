import { render, screen } from '@testing-library/react'

import Checkbox from './Checkbox'

describe('Checkbox', () => {
  describe('renders default radio input', () => {
    it('renders default with label', async () => {
      render(<Checkbox label={'This is the label'} />)

      const label = await screen.findByText('This is the label')
      expect(label).toBeInTheDocument()
    })
  })
})

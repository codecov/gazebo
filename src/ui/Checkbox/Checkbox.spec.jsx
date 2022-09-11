import { render } from '@testing-library/react'

import Checkbox from './Checkbox'

describe('Checkbox', () => {
  let wrapper

  describe('renders default radio input', () => {
    it('renders default with label', async () => {
      wrapper = render(<Checkbox label={'This is the label'} />)
      const label = await wrapper.findByText('This is the label')
      expect(label).toBeInTheDocument()
    })
  })
})

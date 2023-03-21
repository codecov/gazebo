import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import OptionButton from './OptionButton'

describe('OptionButton', () => {
  describe('when the modal is closed', () => {
    it('renders options', () => {
      const options = [{ text: 'test option 1' }, { text: 'test option 2' }]
      const onChange = jest.fn()
      render(
        <OptionButton onChange={onChange} options={options} active="active" />
      )

      expect(screen.getByText('test option 1')).toBeInTheDocument()
      expect(screen.getByText('test option 2')).toBeInTheDocument()
    })
    it('fires click event', async () => {
      const options = [{ text: 'test option 1' }, { text: 'test option 2' }]
      const onChange = jest.fn()
      render(
        <OptionButton onChange={onChange} options={options} active="active" />
      )

      const user = userEvent.setup()
      await user.click(screen.queryByText('test option 2'))
      expect(onChange).toHaveBeenCalled()
    })
  })
})

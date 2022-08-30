import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ToggleHeader from './ToggleHeader'

describe('ToggleHeader', () => {
  const onFlagsChange = jest.fn()
  function setup(props) {
    render(
      <ToggleHeader
        title={'sample title'}
        onFlagsChange={onFlagsChange}
        {...props}
      />
    )
  }

  describe('when there is no flags data', () => {
    beforeEach(() => {
      setup({
        coverageIsLoading: false,
        flagNames: [],
      })
    })

    it('renders title', () => {
      expect(screen.getByText('sample title')).toBeInTheDocument()
    })
    it('does not render flags multi-select', () => {
      expect(screen.queryByText('All flags')).not.toBeInTheDocument()
    })
  })

  describe('when there is flags data', () => {
    beforeEach(() => {
      setup({
        coverageIsLoading: false,
        flagNames: ['flag1', 'flag2'],
      })
      const button = screen.getByText('All flags')
      userEvent.click(button)
    })

    it('renders all flags title', () => {
      const title = screen.getByRole('button', {
        name: /Filter by flags/i,
      })

      expect(title).toHaveTextContent(/All flags/)
    })

    it('renders flags in the list', () => {
      expect(screen.getByText('flag1')).toBeInTheDocument()
      expect(screen.getByText('flag2')).toBeInTheDocument()
    })

    describe('when a flag is selected', () => {
      beforeEach(() => {
        userEvent.click(screen.getByText(/flag1/))
      })

      it('calls onFlagsChange with the value', () => {
        expect(onFlagsChange).toHaveBeenCalledWith(['flag1'])
      })
    })
  })
})

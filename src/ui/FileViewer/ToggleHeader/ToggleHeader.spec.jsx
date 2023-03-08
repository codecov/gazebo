import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ToggleHeader from './ToggleHeader'

describe('ToggleHeader', () => {
  const onFlagsChange = jest.fn()

  describe('when there is no flags data', () => {
    it('renders title', () => {
      render(
        <ToggleHeader
          title={'sample title'}
          onFlagsChange={onFlagsChange}
          coverageIsLoading={false}
          flagNames={[]}
        />
      )

      const title = screen.getByText('sample title')
      expect(title).toBeInTheDocument()
    })

    it('does not render flags multi-select', () => {
      render(
        <ToggleHeader
          title={'sample title'}
          onFlagsChange={onFlagsChange}
          coverageIsLoading={false}
          flagNames={[]}
        />
      )

      const multiSelect = screen.queryByText('All Flags')
      expect(multiSelect).not.toBeInTheDocument()
    })
  })

  describe('when there is flags data', () => {
    it('renders all flags title', () => {
      render(
        <ToggleHeader
          title={'sample title'}
          onFlagsChange={onFlagsChange}
          coverageIsLoading={false}
          flagNames={['flag1', 'flag2']}
        />
      )

      const button = screen.getByText('All Flags')
      userEvent.click(button)

      const title = screen.getByRole('button', {
        name: /Filter by flags/i,
      })

      expect(title).toHaveTextContent(/All Flags/)
    })

    it('renders flags in the list', () => {
      render(
        <ToggleHeader
          title={'sample title'}
          onFlagsChange={onFlagsChange}
          coverageIsLoading={false}
          flagNames={['flag1', 'flag2']}
        />
      )

      const button = screen.getByText('All Flags')
      userEvent.click(button)

      expect(screen.getByText('flag1')).toBeInTheDocument()
      expect(screen.getByText('flag2')).toBeInTheDocument()
    })

    describe('when a flag is selected', () => {
      it('calls onFlagsChange with the value', async () => {
        render(
          <ToggleHeader
            title={'sample title'}
            onFlagsChange={onFlagsChange}
            coverageIsLoading={false}
            flagNames={['flag1', 'flag2']}
          />
        )

        const button = screen.getByText('All Flags')
        userEvent.click(button)

        const flag1Click = screen.getByText(/flag1/)
        userEvent.click(flag1Click)

        await waitFor(() =>
          expect(onFlagsChange).toHaveBeenCalledWith(['flag1'])
        )
      })
    })
  })
})

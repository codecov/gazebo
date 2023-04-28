import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ToggleHeader from './ToggleHeader'

describe('ToggleHeader', () => {
  function setup() {
    const user = userEvent.setup()
    const onFlagsChange = jest.fn()

    return { user, onFlagsChange }
  }

  describe('when there is no flags data', () => {
    it('renders title', () => {
      const { onFlagsChange } = setup()
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
      const { onFlagsChange } = setup()
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
    it('renders all flags title', async () => {
      const { onFlagsChange, user } = setup()
      render(
        <ToggleHeader
          title={'sample title'}
          onFlagsChange={onFlagsChange}
          coverageIsLoading={false}
          flagNames={['flag1', 'flag2']}
        />
      )

      const button = screen.getByText('All Flags')
      await user.click(button)

      const title = screen.getByRole('button', {
        name: /Filter by flags/i,
      })

      expect(title).toHaveTextContent(/All Flags/)
    })

    it('renders flags in the list', async () => {
      const { onFlagsChange, user } = setup()
      render(
        <ToggleHeader
          title={'sample title'}
          onFlagsChange={onFlagsChange}
          coverageIsLoading={false}
          flagNames={['flag1', 'flag2']}
        />
      )

      const button = screen.getByText('All Flags')
      await user.click(button)

      expect(screen.getByText('flag1')).toBeInTheDocument()
      expect(screen.getByText('flag2')).toBeInTheDocument()
    })

    describe('when a flag is selected', () => {
      it('calls onFlagsChange with the value', async () => {
        const { onFlagsChange, user } = setup()
        render(
          <ToggleHeader
            title={'sample title'}
            onFlagsChange={onFlagsChange}
            coverageIsLoading={false}
            flagNames={['flag1', 'flag2']}
          />
        )

        const button = screen.getByText('All Flags')
        await user.click(button)

        const flag1Click = screen.getByText(/flag1/)
        await user.click(flag1Click)

        await waitFor(() =>
          expect(onFlagsChange).toHaveBeenCalledWith(['flag1'])
        )
      })
    })
  })

  describe('when showHitCount prop is passed', () => {
    describe('prop is set to true', () => {
      it('renders legend', () => {
        render(
          <ToggleHeader
            title={'sample title'}
            coverageIsLoading={false}
            showHitCount={true}
          />
        )

        const hitIcon = screen.getByText('n')
        expect(hitIcon).toBeInTheDocument()

        const legendText = screen.getByText('upload #')
        expect(legendText).toBeInTheDocument()
      })
    })

    describe('prop is set to false', () => {
      it('does not render legend', () => {
        render(
          <ToggleHeader
            title={'sample title'}
            coverageIsLoading={false}
            showHitCount={false}
          />
        )

        const hitIcon = screen.queryByText('n')
        expect(hitIcon).not.toBeInTheDocument()

        const legendText = screen.queryByText('upload #')
        expect(legendText).not.toBeInTheDocument()
      })
    })
  })
})

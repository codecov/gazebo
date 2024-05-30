import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ToggleElement from './ToggleElement'

jest.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = jest.fn()

describe('Toggle Element', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('custom props', () => {
    describe('renders the open', () => {
      it('toggle controls', () => {
        render(
          <ToggleElement
            localStorageKey="c2"
            showElement="Show Chart"
            hideElement="Hide Chart"
          >
            Mighty Nein
          </ToggleElement>
        )

        const hideChart = screen.getByText('Hide Chart')
        const chevronDown = screen.getByText('chevron-down.svg')

        expect(hideChart).toBeInTheDocument()
        expect(chevronDown).toBeInTheDocument()
      })

      it('children', () => {
        render(
          <ToggleElement
            localStorageKey="c2"
            showElement="Show Chart"
            hideElement="Hide Chart"
          >
            Mighty Nein
          </ToggleElement>
        )

        const contents = screen.getByText('Mighty Nein')

        expect(contents).toBeInTheDocument()
      })
    })

    describe('renders the closed', () => {
      it('toggle controls', async () => {
        const { user } = setup()
        render(
          <ToggleElement
            localStorageKey="c2"
            showElement="Show Chart"
            hideElement="Hide Chart"
          >
            Mighty Nein
          </ToggleElement>
        )

        const hideChart = screen.getByText('Hide Chart')
        const chevronDown = screen.getByText('chevron-down.svg')

        expect(hideChart).toBeInTheDocument()
        expect(chevronDown).toBeInTheDocument()

        await user.click(screen.getByRole('button'))

        const removedHideChart = screen.queryByText('Hide Chart')
        const removedChevronDown = screen.queryByText('chevron-down.svg')
        const ShowSChart = screen.getByText('Show Chart')
        const chevronRight = screen.getByText('chevron-right.svg')

        expect(removedHideChart).not.toBeInTheDocument()
        expect(removedChevronDown).not.toBeInTheDocument()
        expect(ShowSChart).toBeInTheDocument()
        expect(chevronRight).toBeInTheDocument()
      })

      it('children', async () => {
        const { user } = setup()
        render(
          <ToggleElement
            localStorageKey="c2"
            showElement="Show Chart"
            hideElement="Hide Chart"
          >
            Mighty Nein
          </ToggleElement>
        )

        const button = screen.getByRole('button')
        const contents = screen.getByText('Mighty Nein')

        expect(contents).not.toHaveClass('hidden')

        await user.click(button)

        const hiddenContents = screen.getByText('Mighty Nein')

        expect(hiddenContents).toHaveClass('hidden')
      })
    })
  })
})

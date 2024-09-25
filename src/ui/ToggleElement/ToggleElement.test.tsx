import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToggleElement } from './ToggleElement'

vi.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = vi.fn()

describe('ToggleElement', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  it('renders passed toggleRowElement', () => {
    setup()
    render(
      <ToggleElement
        localStorageKey="c2"
        showButtonContent="Show Chart"
        hideButtonContent="Hide Chart"
        toggleRowElement={<p>Toggle Row Element</p>}
      >
        Cool contents
      </ToggleElement>
    )

    const toggleRowElement = screen.getByText('Toggle Row Element')
    expect(toggleRowElement).toBeInTheDocument()
  })

  describe('renders open toggle', () => {
    it('toggle controls', () => {
      render(
        <ToggleElement
          localStorageKey="c2"
          showButtonContent="Show Chart"
          hideButtonContent="Hide Chart"
        >
          Cool contents
        </ToggleElement>
      )

      const hideChart = screen.getByText('Hide Chart')
      expect(hideChart).toBeInTheDocument()
    })

    it('children', () => {
      render(
        <ToggleElement
          localStorageKey="c2"
          showButtonContent="Show Chart"
          hideButtonContent="Hide Chart"
        >
          Cool contents
        </ToggleElement>
      )

      const contents = screen.getByText('Cool contents')
      expect(contents).toBeInTheDocument()
    })
  })

  describe('renders closed toggle', () => {
    it('toggle controls', async () => {
      const { user } = setup()
      render(
        <ToggleElement
          localStorageKey="c2"
          showButtonContent="Show Chart"
          hideButtonContent="Hide Chart"
        >
          Cool contents
        </ToggleElement>
      )

      const hideChart = screen.getByText('Hide Chart')
      expect(hideChart).toBeInTheDocument()

      const button = screen.getByRole('button')
      await user.click(button)

      const removedHideChart = screen.queryByText('Hide Chart')
      expect(removedHideChart).not.toBeInTheDocument()

      const ShowSChart = screen.getByText('Show Chart')
      expect(ShowSChart).toBeInTheDocument()
    })

    it('children', async () => {
      const { user } = setup()
      render(
        <ToggleElement
          localStorageKey="c2"
          showButtonContent="Show Chart"
          hideButtonContent="Hide Chart"
        >
          Cool contents
        </ToggleElement>
      )

      const contents = screen.getByText('Cool contents')
      expect(contents).not.toHaveClass('hidden')

      const button = screen.getByRole('button')
      await user.click(button)

      const hiddenContents = screen.getByText('Cool contents')
      expect(hiddenContents).toHaveClass('hidden')
    })
  })

  describe('localStorage', () => {
    describe('first click', () => {
      it('sets value to true', async () => {
        const { user } = setup()
        render(
          <ToggleElement
            localStorageKey="c2"
            showButtonContent="Show Chart"
            hideButtonContent="Hide Chart"
          >
            Cool contents
          </ToggleElement>
        )

        const button = screen.getByRole('button')
        await user.click(button)

        expect(window.localStorage.setItem).toHaveBeenCalledWith('c2', 'true')
      })
    })

    describe('second click', () => {
      it('swaps vale to false', async () => {
        const { user } = setup()
        render(
          <ToggleElement
            localStorageKey="c2"
            showButtonContent="Show Chart"
            hideButtonContent="Hide Chart"
          >
            Cool contents
          </ToggleElement>
        )

        const button = screen.getByRole('button')
        await user.click(button)
        await user.click(button)

        expect(window.localStorage.setItem).toHaveBeenCalledWith('c2', 'false')
      })
    })
  })
})

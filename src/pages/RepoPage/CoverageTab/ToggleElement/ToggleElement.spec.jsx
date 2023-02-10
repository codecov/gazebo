import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ToggleElement from './ToggleElement'

jest.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = jest.fn()

describe('Toggle Element', () => {
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

        expect(screen.getByText('Hide Chart')).toBeInTheDocument()
        expect(screen.getByText('chevron-down.svg')).toBeInTheDocument()
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

        expect(screen.getByText('Mighty Nein')).toBeInTheDocument()
      })
    })

    describe('renders the closed', () => {
      it('toggle controls', async () => {
        render(
          <ToggleElement
            localStorageKey="c2"
            showElement="Show Chart"
            hideElement="Hide Chart"
          >
            Mighty Nein
          </ToggleElement>
        )

        expect(screen.getByText('Hide Chart')).toBeInTheDocument()
        expect(screen.getByText('chevron-down.svg')).toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        expect(screen.queryByText('Hide Chart')).not.toBeInTheDocument()
        expect(screen.queryByText('chevron-down.svg')).not.toBeInTheDocument()

        expect(screen.getByText('Show Chart')).toBeInTheDocument()
        expect(screen.getByText('chevron-right.svg')).toBeInTheDocument()
      })

      it('children', async () => {
        render(
          <ToggleElement
            localStorageKey="c2"
            showElement="Show Chart"
            hideElement="Hide Chart"
          >
            Mighty Nein
          </ToggleElement>
        )

        expect(screen.getByText('Mighty Nein')).not.toHaveClass('hidden')

        userEvent.click(screen.getByRole('button'))

        expect(screen.queryByText('Mighty Nein')).toHaveClass('hidden')
      })
    })
  })
})

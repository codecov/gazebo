import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { RadioTileGroup } from './RadioTileGroup'

describe('Card', () => {
  function setup() {
    return {
      user: userEvent.setup(),
    }
  }

  it('renders', async () => {
    render(
      <RadioTileGroup>
        <RadioTileGroup.Item value="asdf" label="Asdf" />
        <RadioTileGroup.Item value="jkl;" label="Jkl;" />
      </RadioTileGroup>
    )
    const item1 = await screen.findByText('Asdf')
    expect(item1).toBeInTheDocument()
    const item2 = await screen.findByText('Jkl;')
    expect(item2).toBeInTheDocument()
  })

  describe('Item description', () => {
    it('renders', async () => {
      render(
        <RadioTileGroup>
          <RadioTileGroup.Item
            value="asdf"
            label="Asdf"
            description="This is a description."
          />
        </RadioTileGroup>
      )
      const description = await screen.findByText('This is a description.')
      expect(description).toBeInTheDocument()
    })
  })

  describe('when an item is clicked', () => {
    it('toggles selected circle', async () => {
      const { user } = setup()
      render(
        <RadioTileGroup>
          <RadioTileGroup.Item value="asdf" label="Asdf" />
          <RadioTileGroup.Item value="jkl;" label="Jkl;" />
        </RadioTileGroup>
      )
      const tile = await screen.findByText('Asdf')
      const tile2 = await screen.findByText('Jkl;')

      user.click(tile)

      const selected = await screen.findByTestId('radio-button-circle-selected')
      expect(selected).toBeInTheDocument()

      user.click(tile2)

      await waitForElementToBeRemoved(selected)

      expect(selected).not.toBeInTheDocument()

      const otherSelected = await screen.findByTestId(
        'radio-button-circle-selected'
      )
      expect(otherSelected).toBeInTheDocument()
    })
  })
})

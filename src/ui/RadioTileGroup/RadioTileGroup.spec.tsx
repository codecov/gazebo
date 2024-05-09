import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { RadioTileGroup } from './RadioTileGroup'

describe('RadioTileGroup', () => {
  function setup() {
    return {
      user: userEvent.setup(),
    }
  }

  it('renders', async () => {
    render(
      <RadioTileGroup>
        <RadioTileGroup.Item value="asdf">
          <RadioTileGroup.Label>Asdf</RadioTileGroup.Label>
        </RadioTileGroup.Item>
        <RadioTileGroup.Item value="jkl;">
          <RadioTileGroup.Label>Jkl;</RadioTileGroup.Label>
        </RadioTileGroup.Item>
      </RadioTileGroup>
    )
    const item1 = await screen.findByText('Asdf')
    expect(item1).toBeInTheDocument()
    const item2 = await screen.findByText('Jkl;')
    expect(item2).toBeInTheDocument()
  })

  describe('item title', () => {
    it('has htmlFor attribute when used inside Item', async () => {
      render(
        <RadioTileGroup>
          <RadioTileGroup.Item value="test">
            <RadioTileGroup.Label>Label</RadioTileGroup.Label>
          </RadioTileGroup.Item>
        </RadioTileGroup>
      )
      const label = await screen.findByText('Label')
      expect(label).toBeInTheDocument()
      expect(label.hasAttribute('for')).toBeTruthy()
    })

    it('does not have htmlFor attribute when Context is null', async () => {
      render(
        <RadioGroupPrimitive.Root>
          <RadioGroupPrimitive.Item value="asdf">
            <RadioTileGroup.Label>Label</RadioTileGroup.Label>
          </RadioGroupPrimitive.Item>
        </RadioGroupPrimitive.Root>
      )
      const label = await screen.findByText('Label')
      expect(label).toBeInTheDocument()
      expect(label.hasAttribute('for')).toBeFalsy()
    })
  })

  describe('item description', () => {
    it('renders', async () => {
      render(
        <RadioTileGroup>
          <RadioTileGroup.Item value="asdf">
            <RadioTileGroup.Label>Asdf</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              This is a description.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
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
          <RadioTileGroup.Item value="asdf">
            <RadioTileGroup.Label>Asdf</RadioTileGroup.Label>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item value="jkl;">
            <RadioTileGroup.Label>Jkl;</RadioTileGroup.Label>
          </RadioTileGroup.Item>
        </RadioTileGroup>
      )
      const tile = await screen.findByText('Asdf')
      const tile2 = await screen.findByText('Jkl;')

      await user.click(tile)

      const selected = await screen.findByTestId('radio-button-circle-selected')
      expect(selected).toBeInTheDocument()

      await user.click(tile2)

      expect(selected).not.toBeInTheDocument()

      const otherSelected = await screen.findByTestId(
        'radio-button-circle-selected'
      )
      expect(otherSelected).toBeInTheDocument()
    })
  })
})

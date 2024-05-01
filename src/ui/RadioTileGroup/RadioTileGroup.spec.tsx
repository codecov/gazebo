import { render, screen } from '@testing-library/react'

import { RadioTileGroup } from './RadioTileGroup'

describe('Card', () => {
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
})

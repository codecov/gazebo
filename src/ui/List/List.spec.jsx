import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import List from '.'

describe('List', () => {
  function setup() {
    const user = userEvent.setup()
    const onItemSelect = jest.fn()

    return {
      onItemSelect,
      user,
    }
  }

  it("doesn't render anything when items array is empty", () => {
    const { onItemSelect } = setup()

    const { container } = render(
      <List items={[]} onItemSelect={onItemSelect} noBorder={Boolean(false)} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a list item for every item provided', () => {
    const items = [
      {
        name: 'firstItem',
        value: 'Item value',
      },
      {
        name: 'secondItem',
        value: <span>Markup value</span>,
      },
    ]
    const { onItemSelect } = setup()

    const { container } = render(
      <List
        items={items}
        onItemSelect={onItemSelect}
        noBorder={Boolean(false)}
      />
    )

    expect(container).not.toBeEmptyDOMElement()

    const firstItem = screen.getByText('Item value')
    expect(firstItem).toBeInTheDocument()

    const secondItem = screen.getByText('Markup value')
    expect(secondItem).toBeInTheDocument()
  })

  it('calls onItemSelect prop when clicked', async () => {
    const items = [
      {
        name: 'firstItem',
        value: 'Click me',
      },
    ]
    const { onItemSelect, user } = setup()

    const { container } = render(
      <List
        items={items}
        onItemSelect={onItemSelect}
        noBorder={Boolean(false)}
      />
    )

    expect(container).not.toBeEmptyDOMElement()

    const listItem = screen.getByText(/click me/i)
    expect(listItem).toBeInTheDocument()
    await user.click(listItem)

    expect(onItemSelect).toHaveBeenCalledTimes(1)
  })

  it('Renders without a border when noBorder is true', () => {
    const items = [
      {
        name: 'firstItem',
        value: 'Click me',
      },
    ]
    const { onItemSelect } = setup()

    render(
      <List
        items={items}
        onItemSelect={onItemSelect}
        noBorder={Boolean(true)}
      />
    )

    const list = screen.getByRole('list')
    expect(list).not.toHaveClass('border border-ds-gray-secondary')
  })
})

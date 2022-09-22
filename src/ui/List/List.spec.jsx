import { fireEvent, render, screen } from '@testing-library/react'

import List from '.'

describe('List', () => {
  let container
  const onItemSelect = jest.fn()

  function setup({ items, noBorder }) {
    ;({ container } = render(
      <List
        items={items}
        onItemSelect={onItemSelect}
        noBorder={Boolean(noBorder)}
      />
    ))
  }

  it("doesn't render anything when items array is empty", () => {
    const items = []
    setup({ items })

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
    setup({ items })

    expect(container).not.toBeEmptyDOMElement()

    expect(screen.getByText('Item value')).toBeInTheDocument()
    expect(screen.getByText('Markup value')).toBeInTheDocument()
  })

  it('calls onItemSelect prop when clicked', () => {
    const items = [
      {
        name: 'firstItem',
        value: 'Click me',
      },
    ]
    setup({ items })

    expect(container).not.toBeEmptyDOMElement()
    const listItem = screen.getByText(/click me/i)
    expect(listItem).toBeInTheDocument()
    fireEvent.click(listItem)
    expect(onItemSelect).toHaveBeenCalledTimes(1)
  })

  it('Renders without a border when noBorder is true', () => {
    const items = [
      {
        name: 'firstItem',
        value: 'Click me',
      },
    ]
    setup({ items, noBorder: true })
    expect(screen.getByRole('list')).not.toHaveClass(
      'border border-ds-gray-secondary'
    )
  })
})

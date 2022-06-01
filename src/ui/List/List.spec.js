import { render, screen } from '@testing-library/react'

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

  describe('when user selects an item', () => {
    beforeEach(() => {
      const items = [
        {
          name: 'firstItem',
          value: 'Click me',
          selected: true,
        },
      ]
      setup({ items })
      screen.getByText(/click me/i).click()
    })

    it('calls onItemSelect', () => {
      expect(onItemSelect).toHaveBeenCalledTimes(1)
    })

    it('shows a border', () => {
      expect(screen.queryByRole('listitem', /click me/i)).toHaveClass(
        'border border-ds-blue-darker'
      )
    })
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

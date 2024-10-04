import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResizeObserver from 'resize-observer-polyfill'

import { Tooltip } from './Tooltip'

global.ResizeObserver = ResizeObserver

describe('Tooltip', () => {
  it('renders Tooltip correctly', () => {
    render(
      <Tooltip>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content>Tooltip Content</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip>
    )

    const triggerElement = screen.getByText('Hover me')
    expect(triggerElement).toBeInTheDocument()
  })

  it('displays the Tooltip Content on hover', async () => {
    render(
      <Tooltip>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content data-state="instant-open">
              Tooltip Content
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip>
    )

    const triggerElement = await screen.findByText('Hover me')
    await userEvent.hover(triggerElement)

    const contentElement = await screen.findByText('Tooltip Content', {
      selector: 'div',
    })
    expect(contentElement).toBeInTheDocument()
  })

  it('hides the Tooltip Content when not hovered', async () => {
    render(
      <Tooltip>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content>Tooltip Content</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip>
    )

    const contentElement = screen.queryByText('Tooltip Content')
    expect(contentElement).not.toBeInTheDocument()
  })

  it('applies custom className to Tooltip Content', async () => {
    render(
      <Tooltip>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="border-black" data-state="instant-open">
              Tooltip Content
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip>
    )

    const triggerElement = await screen.findByText('Hover me')
    await userEvent.hover(triggerElement)

    const contentElement = await screen.findByText('Tooltip Content', {
      selector: 'div',
    })
    expect(contentElement).toHaveClass('border-black')
  })

  it('displays arrow element when Tooltip Content is displayed', async () => {
    render(
      <Tooltip>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content data-state="instant-open">
              Tooltip Content
              <Tooltip.Arrow data-testid="tooltip-arrow" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip>
    )

    const triggerElement = await screen.findByText('Hover me')
    await userEvent.hover(triggerElement)

    const arrowElement = await screen.findByTestId('tooltip-arrow')
    expect(arrowElement).toBeInTheDocument()
  })
})

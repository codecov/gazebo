import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResizeObserver from 'resize-observer-polyfill'

import { Tooltip } from './Tooltip'

global.ResizeObserver = ResizeObserver

describe('Tooltip', () => {
  it('throws an error if Tooltip is used without TooltipProvider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    expect(() =>
      render(
        <Tooltip>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content>Tooltip Content</Tooltip.Content>
        </Tooltip>
      )
    ).toThrow('`Tooltip` must be used within `TooltipProvider`')

    consoleError.mockRestore()
  })

  it('renders Tooltip correctly when wrapped with TooltipProvider', () => {
    render(
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content>Tooltip Content</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    )

    const triggerElement = screen.getByText('Hover me')
    expect(triggerElement).toBeInTheDocument()
  })

  it('displays the Tooltip Content on hover when wrapped with TooltipProvider', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content data-state="instant-open">
            Tooltip Content
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    )

    const triggerElement = await screen.findByText('Hover me')
    await userEvent.hover(triggerElement)

    const contentElement = await screen.findByText('Tooltip Content', {
      selector: 'div',
    })
    expect(contentElement).toBeInTheDocument()
  })

  it('hides the Tooltip Content when not hovered when wrapped with TooltipProvider', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content>Tooltip Content</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    )

    const contentElement = screen.queryByText('Tooltip Content')
    expect(contentElement).not.toBeInTheDocument()
  })

  it('applies custom className to Tooltip Content when wrapped with TooltipProvider', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content className="border-black" data-state="instant-open">
            Tooltip Content
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    )

    const triggerElement = await screen.findByText('Hover me')
    await userEvent.hover(triggerElement)

    const contentElement = await screen.findByText('Tooltip Content', {
      selector: 'div',
    })
    expect(contentElement).toHaveClass('border-black')
  })

  it('displays arrow element when Tooltip Content is displayed and wrapped with TooltipProvider', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <button>Hover me</button>
          </Tooltip.Trigger>
          <Tooltip.Content data-state="instant-open">
            Tooltip Content
            <Tooltip.Arrow data-testid="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    )

    const triggerElement = await screen.findByText('Hover me')
    await userEvent.hover(triggerElement)

    const arrowElement = await screen.findByTestId('tooltip-arrow')
    expect(arrowElement).toBeInTheDocument()
  })
})

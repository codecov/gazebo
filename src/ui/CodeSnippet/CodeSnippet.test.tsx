import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { CodeSnippet } from './CodeSnippet'

vi.mock('copy-to-clipboard', () => ({ default: () => true }))

describe('CodeSnippet', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  it('renders code', async () => {
    render(<CodeSnippet>asdf</CodeSnippet>)

    const code = await screen.findByText('asdf')
    expect(code).toBeInTheDocument()
  })

  it('renders CopyClipboard', async () => {
    render(<CodeSnippet clipboard="asdf">asdf</CodeSnippet>)

    const clipboard = await screen.findByTestId('clipboard-code-snippet')
    expect(clipboard).toBeInTheDocument()
  })

  describe('when clipboard prop is undefined', () => {
    it('does not render CopyClipboard', async () => {
      render(<CodeSnippet>asdf</CodeSnippet>)

      const clipboard = screen.queryByTestId('clipboard-code-snippet')
      expect(clipboard).not.toBeInTheDocument()
    })
  })

  it('renders multiline code', async () => {
    render(
      <CodeSnippet>{`asdf
asdf
asdf
asdf
wow`}</CodeSnippet>
    )

    const code = await screen.findByText(/asdf\s+asdf\s+asdf\s+asdf\s+wow/)
    expect(code).toBeInTheDocument()
  })

  it('passes clipboardOnClick through to CopyClipboard', async () => {
    const { user } = setup()
    const callback = vi.fn()
    render(
      <CodeSnippet clipboard="asdf" clipboardOnClick={callback}>
        asdf
      </CodeSnippet>
    )

    const clipboard = await screen.findByTestId('clipboard-code-snippet')
    expect(clipboard).toBeInTheDocument()

    await user.click(clipboard)

    await waitFor(() => expect(callback).toHaveBeenCalledWith('asdf'))
  })
})

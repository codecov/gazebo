import { render, screen } from '@testing-library/react'

import { CodeSnippet } from './CodeSnippet'

describe('CodeSnippet', () => {
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
})

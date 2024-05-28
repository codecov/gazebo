import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExpandableSection } from 'ui/ExpandableSection'

describe('ExpandableSection', () => {
  it('renders the title correctly', () => {
    const title = 'Test Title'
    render(
      <ExpandableSection title={title}>
        <div>Content</div>
      </ExpandableSection>
    )
    const titleElement = screen.getByText(title)
    expect(titleElement).toBeInTheDocument()
  })

  it('renders the children correctly after expanding', async () => {
    render(
      <ExpandableSection title="Test Title">
        <div>Test Content</div>
      </ExpandableSection>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    const contentElement = screen.getByText('Test Content')
    expect(contentElement).toBeInTheDocument()
  })

  it('collapses the children after clicking the button twice', async () => {
    render(
      <ExpandableSection title="Test Title">Test Content</ExpandableSection>
    )

    const button = screen.getByRole('button')

    await userEvent.click(button)
    const contentElement = screen.getByText('Test Content')
    expect(contentElement).toBeInTheDocument()

    await userEvent.click(button)
    const contentElementAfterCollapse = screen.queryByText('Test Content')
    expect(contentElementAfterCollapse).not.toBeInTheDocument()
  })
})

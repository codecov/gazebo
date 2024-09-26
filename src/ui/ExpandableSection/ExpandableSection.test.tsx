import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExpandableSection } from 'ui/ExpandableSection'

interface TestExpandableSectionProps {
  title: string
}

const TestExpandableSection: React.FC<
  React.PropsWithChildren<TestExpandableSectionProps>
> = ({ title, children }) => {
  return (
    <ExpandableSection>
      <ExpandableSection.Trigger>{title}</ExpandableSection.Trigger>
      <ExpandableSection.Content>{children}</ExpandableSection.Content>
    </ExpandableSection>
  )
}

describe('ExpandableSection', () => {
  it('renders the title correctly', () => {
    const title = 'Test Title'
    render(
      <TestExpandableSection title={title}>
        <div>Content</div>
      </TestExpandableSection>
    )
    const titleElement = screen.getByText(title)
    expect(titleElement).toBeInTheDocument()
  })

  it('renders the children correctly after expanding', async () => {
    render(
      <TestExpandableSection title="Test Title">
        <div>Test Content</div>
      </TestExpandableSection>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    const contentElement = screen.getByText('Test Content')
    expect(contentElement).toBeInTheDocument()
  })

  it('collapses the children after clicking the button twice', async () => {
    render(
      <TestExpandableSection title="Test Title">
        Test Content
      </TestExpandableSection>
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

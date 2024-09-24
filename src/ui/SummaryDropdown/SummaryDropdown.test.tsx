import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SummaryDropdown } from './SummaryDropdown'

describe('SummaryDropdown', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('rendering component', () => {
    it('only renders the titles', () => {
      render(
        <SummaryDropdown type="multiple">
          <SummaryDropdown.Item value="first">
            <SummaryDropdown.Trigger>First</SummaryDropdown.Trigger>
            <SummaryDropdown.Content>First Content</SummaryDropdown.Content>
          </SummaryDropdown.Item>
          <SummaryDropdown.Item value="second">
            <SummaryDropdown.Trigger>Second</SummaryDropdown.Trigger>
            <SummaryDropdown.Content>Second Content</SummaryDropdown.Content>
          </SummaryDropdown.Item>
        </SummaryDropdown>
      )

      const firstTitle = screen.getByText('First')
      expect(firstTitle).toBeInTheDocument()

      const secondTitle = screen.getByText('Second')
      expect(secondTitle).toBeInTheDocument()
    })

    it('does not render the content', () => {
      render(
        <SummaryDropdown type="multiple">
          <SummaryDropdown.Item value="first">
            <SummaryDropdown.Trigger>First</SummaryDropdown.Trigger>
            <SummaryDropdown.Content>First Content</SummaryDropdown.Content>
          </SummaryDropdown.Item>
          <SummaryDropdown.Item value="second">
            <SummaryDropdown.Trigger>Second</SummaryDropdown.Trigger>
            <SummaryDropdown.Content>Second Content</SummaryDropdown.Content>
          </SummaryDropdown.Item>
        </SummaryDropdown>
      )

      const firstContent = screen.queryByText('First Content')
      expect(firstContent).not.toBeInTheDocument()

      const secondContent = screen.queryByText('Second Content')
      expect(secondContent).not.toBeInTheDocument()
    })

    describe('opening a dropdown', () => {
      it('renders the content', async () => {
        const { user } = setup()
        render(
          <SummaryDropdown type="multiple">
            <SummaryDropdown.Item value="first">
              <SummaryDropdown.Trigger>First</SummaryDropdown.Trigger>
              <SummaryDropdown.Content>First Content</SummaryDropdown.Content>
            </SummaryDropdown.Item>
            <SummaryDropdown.Item value="second">
              <SummaryDropdown.Trigger>Second</SummaryDropdown.Trigger>
              <SummaryDropdown.Content>Second Content</SummaryDropdown.Content>
            </SummaryDropdown.Item>
          </SummaryDropdown>
        )

        const firstTitle = screen.getByText('First')
        expect(firstTitle).toBeInTheDocument()
        await user.click(firstTitle)

        const firstContent = screen.getByText('First Content')
        expect(firstContent).toBeInTheDocument()
      })
    })

    describe('closing a dropdown', () => {
      it('hides the content', async () => {
        const { user } = setup()
        render(
          <SummaryDropdown type="multiple" defaultValue={['first']}>
            <SummaryDropdown.Item value="first">
              <SummaryDropdown.Trigger>First</SummaryDropdown.Trigger>
              <SummaryDropdown.Content>First Content</SummaryDropdown.Content>
            </SummaryDropdown.Item>
            <SummaryDropdown.Item value="second">
              <SummaryDropdown.Trigger>Second</SummaryDropdown.Trigger>
              <SummaryDropdown.Content>Second Content</SummaryDropdown.Content>
            </SummaryDropdown.Item>
          </SummaryDropdown>
        )

        const firstTitle = screen.getByText('First')
        expect(firstTitle).toBeInTheDocument()
        await user.click(firstTitle)

        const firstContent = screen.queryByText('First Content')
        expect(firstContent).not.toBeInTheDocument()
      })
    })
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Dropdown } from './Dropdown'

describe('Dropdown', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('rendering component', () => {
    it('only renders the trigger', () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>My Dropdown</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>First item</Dropdown.Item>
            <Dropdown.Item>Second item</Dropdown.Item>
            <Dropdown.Item>Third item</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      )

      const dropdownTrigger = screen.getByText('My Dropdown')
      expect(dropdownTrigger).toBeInTheDocument()

      const firstItem = screen.queryByText('First item')
      expect(firstItem).not.toBeInTheDocument()
    })

    describe('opening a dropdown', () => {
      it('renders the content', async () => {
        const { user } = setup()
        render(
          <Dropdown>
            <Dropdown.Trigger>My Dropdown</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>First item</Dropdown.Item>
              <Dropdown.Item>Second item</Dropdown.Item>
              <Dropdown.Item>Third item</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        )

        const dropdownTrigger = screen.getByText('My Dropdown')
        expect(dropdownTrigger).toBeInTheDocument()
        await user.click(dropdownTrigger)

        const firstItem = screen.getByText('First item')
        expect(firstItem).toBeInTheDocument()
      })

      it('renders the label', async () => {
        const { user } = setup()
        render(
          <Dropdown>
            <Dropdown.Trigger>My Dropdown</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Label>The Label</Dropdown.Label>
              <Dropdown.Item>First item</Dropdown.Item>
              <Dropdown.Item>Second item</Dropdown.Item>
              <Dropdown.Item>Third item</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        )

        const dropdownTrigger = screen.getByText('My Dropdown')
        expect(dropdownTrigger).toBeInTheDocument()
        await user.click(dropdownTrigger)

        const label = screen.getByText('The Label')
        expect(label).toBeInTheDocument()
      })
    })

    describe('closing a dropdown', () => {
      it('hides the content', async () => {
        const { user } = setup()
        render(
          <Dropdown>
            <Dropdown.Trigger>My Dropdown</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>First item</Dropdown.Item>
              <Dropdown.Item>Second item</Dropdown.Item>
              <Dropdown.Item>Third item</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        )

        const dropdownTrigger = screen.getByText('My Dropdown')
        expect(dropdownTrigger).toBeInTheDocument()
        await user.click(dropdownTrigger)

        const firstItem = screen.getByText('First item')
        expect(firstItem).toBeInTheDocument()
        await user.click(firstItem)

        const newFirstItem = screen.queryByText('First item')
        expect(newFirstItem).not.toBeInTheDocument()
      })
    })

    describe('toggling the chevron icon', () => {
      it('flips the chevron', async () => {
        const { user } = setup()
        render(
          <Dropdown>
            <Dropdown.Trigger>My Dropdown</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>First item</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        )

        const trigger = screen.getByText('My Dropdown')
        expect(trigger).toBeInTheDocument()
        const chevron = screen.getByTestId('dropdown-trigger-chevron')
        expect(chevron).toBeInTheDocument()

        expect(chevron).toHaveClass('rotate-0')

        await user.click(trigger)
        expect(chevron).toHaveClass('rotate-180')

        const firstItem = screen.getByText('First item')
        expect(firstItem).toBeInTheDocument()
        await user.click(firstItem)

        expect(chevron).toHaveClass('rotate-0')
      })
    })
  })
})

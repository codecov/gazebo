import type { Meta, StoryObj } from '@storybook/react'

import SummaryDropdownComponent from './index'

const meta: Meta<typeof SummaryDropdownComponent> = {
  title: 'Components/SummaryDropdown',
  component: SummaryDropdownComponent,
}

export default meta

type Story = StoryObj<typeof SummaryDropdownComponent>

export const SummaryDropdownMultiple: Story = {
  render: () => (
    <>
      <SummaryDropdownComponent type="multiple">
        <SummaryDropdownComponent.Item value="first-summary">
          <SummaryDropdownComponent.Trigger>
            First Summary
          </SummaryDropdownComponent.Trigger>
          <SummaryDropdownComponent.Content className="bg-white">
            <p>First Summary Content</p>
          </SummaryDropdownComponent.Content>
        </SummaryDropdownComponent.Item>
        <SummaryDropdownComponent.Item value="second-summary">
          <SummaryDropdownComponent.Trigger>
            Second Summary
          </SummaryDropdownComponent.Trigger>
          <SummaryDropdownComponent.Content className="bg-white">
            <p>Second Summary Content</p>
          </SummaryDropdownComponent.Content>
        </SummaryDropdownComponent.Item>
      </SummaryDropdownComponent>
    </>
  ),
}

export const SummaryDropdownSingle: Story = {
  render: () => (
    <>
      <SummaryDropdownComponent type="single">
        <SummaryDropdownComponent.Item value="first-summary">
          <SummaryDropdownComponent.Trigger>
            First Summary
          </SummaryDropdownComponent.Trigger>
          <SummaryDropdownComponent.Content className="bg-white">
            <p>First Summary Content</p>
          </SummaryDropdownComponent.Content>
        </SummaryDropdownComponent.Item>
        <SummaryDropdownComponent.Item value="second-summary">
          <SummaryDropdownComponent.Trigger>
            Second Summary
          </SummaryDropdownComponent.Trigger>
          <SummaryDropdownComponent.Content className="bg-white">
            <p>Second Summary Content</p>
          </SummaryDropdownComponent.Content>
        </SummaryDropdownComponent.Item>
      </SummaryDropdownComponent>
    </>
  ),
}

import SettingsDescriptor from './SettingsDescriptor'

const Template = (args) => <SettingsDescriptor {...args} />

export const BasicSettingsDescriptorUsing = Template.bind({})
BasicSettingsDescriptorUsing.args = {
  title: 'Section Title',
  description: 'Section description',
  content: 'Section content',
}

export const SettingsDescriptorUsingNestedTags = Template.bind({})
SettingsDescriptorUsingNestedTags.args = {
  title: 'Section 2',
  description: 'This section is using nested tags',
  content: (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-ds-pink-tertiary">content items:</h1>
      <ul className="flex flex-col gap-1 underline">
        <li>first item</li>
        <li>second item</li>
      </ul>
    </div>
  ),
}

export default {
  title: 'Components/SettingsDescriptor',
  component: SettingsDescriptor,
}

import TabSection from './TabSection'

const Template = (args) => <TabSection {...args} />

export const BasicTabSectionUsing = Template.bind({})
BasicTabSectionUsing.args = {
  title: 'Section Title',
  description: 'Section description',
  content: 'Section content',
}

export const TabSectionUsingNestedTags = Template.bind({})
TabSectionUsingNestedTags.args = {
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
  title: 'Components/TabSection',
  component: TabSection,
}

import SearchField from './SearchField'

const Template = (args) => (
  <div className="w-[50%] mx-auto">
    <SearchField {...args} />
  </div>
)

export const SimpleSearchField = Template.bind({})
SimpleSearchField.args = {
  active: 'Chetney',
  dataMarketing: 'meta data',
  variant: 'default',
}

export default {
  title: 'Components/SearchField',
  component: SearchField,
  argTypes: { setSearchValue: { action: 'clicked' } },
}

import SearchField from './SearchField'

const Template = (args) => (
  <div className="mx-auto w-1/2">
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

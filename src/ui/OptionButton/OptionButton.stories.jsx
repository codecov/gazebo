import OptionButton from './OptionButton'

const Template = (args) => (
  <div className="w-[50%] mx-auto">
    <OptionButton {...args} />
  </div>
)

export const SimpleOptionButton = Template.bind({})
SimpleOptionButton.args = {
  active: 'Chetney',
  options: [{ text: 'Orym' }, { text: 'Chetney' }, { text: 'Imogen' }],
}

export default {
  title: 'Components/OptionButton',
  component: OptionButton,
  argTypes: { onClick: { action: 'clicked' } },
}

import OptionButton from './OptionButton'

const Template = (args) => (
  <div className="mx-auto w-1/2">
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

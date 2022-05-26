import Label from './Label'

const Template = (args) => (
  <div className="flex gap-2">
    <Label {...args}>Some label 🤠</Label>
    <Label {...args}>
      <span className="text-ds-pink">Dynamic</span> Content
    </Label>
  </div>
)

const TemplateInherits = (args) => (
  <div className="text-ds-blue">
    <p>
      Default inherits the current css color making it extremely flexible. The
      subtle variant will not.
    </p>
    <Label {...args}>Label which can use the `current` css property</Label>
  </div>
)

export const SimpleLabel = Template.bind({})
SimpleLabel.args = {
  variant: 'default',
}

export const SublteLabel = Template.bind({})
SublteLabel.args = {
  variant: 'subtle',
}

export const LabelInherits = TemplateInherits.bind({})
LabelInherits.args = {
  variant: 'default',
}

export default {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    variant: {
      options: ['default', 'subtle'],
      control: { type: 'select' },
    },
  },
}

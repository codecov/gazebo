import CopyClipboard from './CopyClipboard'

const Template = (args) => (
  <div className="flex gap-8 items-start">
    <CopyClipboard {...args} />
    <textarea
      className="border border-solid border-ds-gray"
      rows="4"
      cols="50"
    ></textarea>
  </div>
)

export const SimpleCopyClipboard = Template.bind({})
SimpleCopyClipboard.args = {
  string: 'bells hells',
  showLabel: true,
  variant: 'default',
}

export default {
  title: 'Components/CopyClipboard',
  component: CopyClipboard,
  argTypes: { onClick: { action: 'clicked' } },
}

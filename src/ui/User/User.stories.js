import User from './User'

const Template = (args) => <User {...args} />

export const NormalUser = Template.bind({})
NormalUser.args = {
  avatarUrl: 'https://placedog.net/64',
  username: 'doggo',
  name: 'Roffus',
}

export const NormalUserWithPills = Template.bind({})
NormalUserWithPills.args = {
  ...NormalUser.args,
  pills: ['best friend', 'good boy', 'likes chocolate'],
}

export const NormalUserWithPillObject = Template.bind({})
NormalUserWithPillObject.args = {
  ...NormalUser.args,
  pills: [
    { label: 'best friend', highlight: true },
    { label: 'good boy', className: 'text-blue-400' },
    'likes chocolate',
  ],
}

export default {
  title: 'Components/User',
  component: User,
}

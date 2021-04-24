import Avatar from '.'

const Template = (args) => <Avatar {...args} />

export const WithUserImage = Template.bind({})
WithUserImage.args = {
  avatarUrl: 'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
  alt: 'avatar',
  userName: 'andrewjaeger',
}

export const WithoutUserImage = Template.bind({})
WithoutUserImage.args = {
  avatarUrl: null,
  alt: 'avatar',
  userName: 'andrewjaeger',
}

export default {
  title: 'Components/Avatar',
  component: Avatar,
}

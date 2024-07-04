import List from './List'

import Avatar from '../Avatar'

const Template = (args) => (
  <div className="m-auto size-96 items-start">
    <List {...args} />
  </div>
)

export const SimpleList = Template.bind({})
SimpleList.args = {
  items: [
    {
      name: 'firstItem',
      value: 'First item',
    },
    {
      name: 'secondItem',
      value: 'Second item',
    },
  ],
}

export const ListWithElements = Template.bind({})

const getListItems = () => {
  const listData = [
    {
      username: 'Rabee-AbuBaker',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/99655254?v=3&s=55',
    },
    {
      username: 'codecov',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
    },
  ]
  return listData.map((org) => ({
    name: org.username,
    value: (
      <div className="flex items-center py-2">
        <Avatar user={org} border="light" />
        <div className="mx-2 text-base">{org.username}</div>
      </div>
    ),
  }))
}

ListWithElements.args = {
  items: getListItems(),
}

export default {
  title: 'Components/List',
  component: List,
  argTypes: { onItemSelect: { action: 'clicked' } },
}

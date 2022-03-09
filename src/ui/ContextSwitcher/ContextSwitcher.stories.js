import { MemoryRouter, Route } from 'react-router-dom'

import ContextSwitcher from './ContextSwitcher'

const Template = (args) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/">
      <ContextSwitcher {...args} />
    </Route>
  </MemoryRouter>
)

const contexts = [
  {
    owner: {
      username: 'dorianamouroux',
      avatarUrl: 'https://github.com/dorianamouroux.png?size=40',
    },
    pageName: 'provider',
  },
  {
    owner: {
      username: 'spotify',
      avatarUrl: 'https://github.com/spotify.png?size=40',
    },
    pageName: 'owner',
  },
  {
    owner: {
      username: 'codecov',
      avatarUrl: 'https://github.com/codecov.png?size=40',
    },
    pageName: 'owner',
  },
]

export const SimpleContextSwitcher = Template.bind({})
SimpleContextSwitcher.args = {
  activeContext: 'dorianamouroux',
  contexts,
}

export default {
  title: 'Components/ContextSwitcher',
  component: ContextSwitcher,
}

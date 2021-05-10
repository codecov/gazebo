import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import Dropdown from './Dropdown'

const provider = 'gh'

const user = {
  username: 'p',
  avatarUrl: 'f',
}

const links = [
  { label: 'Settings', to: `/account/${provider}/${user.username}` },
  { label: 'Organizations', to: `/${provider}` },
  { label: 'Sign Out', to: `https://stage-web.codecov.dev/logout/${provider}` },
]

describe('Dropdown', () => {
  let wrapper

  beforeEach(() => {
    wrapper = render(<Dropdown user={user} />, {
      wrapper: (props) => (
        <MemoryRouter initialEntries={[`/${provider}`]}>
          <Switch>
            <Route path="/:provider" exact>
              {props.children}
            </Route>
          </Switch>
        </MemoryRouter>
      ),
    })
  })

  describe('when rendered', () => {
    it('renders the users avatar', () => {
      const img = wrapper.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })

    it('the links arent visible', () => {
      links.forEach((link) => {
        const a = wrapper.getByText(link.label).closest('a')
        expect(a).not.toBeVisible()
      })
    })
  })

  describe('when the avatar is clicked', () => {
    it('the links become visible', () => {
      fireEvent.mouseDown(wrapper.getByRole('button'))
      links.forEach((link) => {
        const a = wrapper.getByText(link.label).closest('a')
        expect(a).toBeVisible()
        expect(a).toHaveAttribute('href', link.to)
      })
    })
  })
})

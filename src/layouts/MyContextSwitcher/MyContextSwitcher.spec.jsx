import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useImage } from 'services/image'
import { useMyContexts } from 'services/user'

import MyContextSwitcher from './MyContextSwitcher'

jest.mock('services/image')
jest.mock('services/user')

const currentUser = {
  username: 'dorianamouroux',
  avatarUrl: 'https://github.com/dorianamouroux.png?size=40',
}
const myOrganizations = [
  {
    username: 'spotify',
    avatarUrl: 'https://github.com/spotify.png?size=40',
  },
  {
    username: 'codecov',
    avatarUrl: 'https://github.com/codecov.png?size=40',
  },
]

describe('MyContextSwitcher', () => {
  let wrapper

  const defaultProps = {
    activeContext: null,
    pageName: 'accountPage',
  }

  function setup(over = {}, myContexts) {
    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    useMyContexts.mockReturnValue({
      data: myContexts,
    })
    const props = {
      ...defaultProps,
      ...over,
    }
    wrapper = render(<MyContextSwitcher {...props} />, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider" exact>
            {children}
          </Route>
        </MemoryRouter>
      ),
    })
  }

  describe('when there are no contexts (user not logged in)', () => {
    beforeEach(() => {
      setup()
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user has some contexts and activeContext is passed to an organization', () => {
    beforeEach(() => {
      setup(
        {
          activeContext: 'codecov',
        },
        {
          currentUser,
          myOrganizations,
        }
      )
    })

    it('renders the button with the organization', () => {
      expect(
        screen.getByRole('button', {
          name: /codecov/i,
        })
      ).toBeInTheDocument()
    })
  })
})

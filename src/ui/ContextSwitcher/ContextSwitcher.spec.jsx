import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useImage } from 'services/image'

import ContextSwitcher from '.'

jest.mock('services/image')

const defaultProps = {
  activeContext: 'dorianamouroux',
  contexts: [
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
  ],
}

function fireClickAndMouseEvents(element) {
  userEvent.click(element)
}

describe('ContextSwitcher', () => {
  let props
  function setup(over = {}) {
    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    props = {
      ...defaultProps,
      ...over,
    }
    render(<ContextSwitcher {...props} />, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/gh']}>
          <Switch>
            <Route path="/:provider" exact>
              {children}
            </Route>
          </Switch>
        </MemoryRouter>
      ),
    })
  }

  describe('when rendered', () => {
    beforeEach(setup)

    it('does not render any link', () => {
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('when the button is clicked', () => {
    beforeEach(() => {
      setup()
      fireClickAndMouseEvents(screen.getByRole('button'))
    })

    it('renders the menu', () => {
      const popover = screen.getByRole('menu')
      expect(popover).toBeVisible()
    })
  })

  describe('when rendered with no active context', () => {
    beforeEach(() => {
      setup({
        activeContext: null,
      })
    })

    it('renders all orgs and repos', () => {
      expect(screen.getByText(/all my orgs and repos/i)).toBeInTheDocument()
    })

    it('renders manage access restrictions', () => {
      expect(
        screen.getByText(/Manage access restrictions/i)
      ).toBeInTheDocument()
    })
  })
})

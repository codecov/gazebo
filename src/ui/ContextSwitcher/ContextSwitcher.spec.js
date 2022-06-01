import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useMyContexts } from '../../services/user'

import ContextSwitcher from '.'

jest.mock('services/user')

const contextData = {
  currentUser: {
    username: 'Rabee-AbuBaker',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/99655254?v=3&s=55',
  },
  myOrganizations: [
    {
      username: 'codecov-org',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
    },
  ],
}

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
  fireEvent.mouseDown(element)
  fireEvent.mouseUp(element)
  fireEvent.click(element)
}

describe('ContextSwitcher', () => {
  function setup(over = {}) {
    const props = {
      ...defaultProps,
      ...over,
    }
    useMyContexts.mockReturnValue({
      data: contextData,
    })

    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Switch>
          <Route path="/:provider" exact>
            <ContextSwitcher {...props} />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(setup)

    it('doesnt render any link', () => {
      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('when the button is clicked', () => {
    beforeEach(() => {
      setup()
      fireClickAndMouseEvents(screen.getByRole('button'))
    })

    it('renders the menu', () => {
      expect(screen.getByText('Switch context')).toBeVisible()
    })

    describe('when user clicks edit default', () => {
      beforeEach(() => {
        screen.getByText(/edit default/i).click()
      })

      it('shows modal and renders orgs', () => {
        expect(
          screen.getByText(/Select default organization/i)
        ).toBeInTheDocument()
        expect(screen.getByText(/codecov-org/i)).toBeInTheDocument()
        expect(screen.getByText(/Rabee-AbuBaker/i)).toBeInTheDocument()
        expect(screen.getByText(/Show all orgs and repos/i)).toBeInTheDocument()
      })

      describe('when user clicks cancel', () => {
        beforeEach(() => {
          screen.getByText(/cancel/i).click()
        })

        it('closes modal', () => {
          expect(
            screen.queryByText(/Select default organization/i)
          ).not.toBeInTheDocument()
          expect(screen.queryByText(/codecov-org/i)).not.toBeInTheDocument()
        })
      })
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

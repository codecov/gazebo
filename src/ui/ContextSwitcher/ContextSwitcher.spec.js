import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import ContextSwitcher from '.'

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
  let wrapper, props
  function setup(over = {}) {
    props = {
      ...defaultProps,
      ...over,
    }
    wrapper = render(<ContextSwitcher {...props} />, {
      wrapper: (props) => (
        <MemoryRouter initialEntries={['/gh']}>
          <Switch>
            <Route path="/:provider" exact>
              {props.children}
            </Route>
          </Switch>
        </MemoryRouter>
      ),
    })
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
      const popover = wrapper.baseElement.querySelector(
        '[data-reach-menu-popover]'
      )
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
  })
})

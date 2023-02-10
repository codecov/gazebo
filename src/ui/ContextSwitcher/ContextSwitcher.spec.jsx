import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useImage } from 'services/image'

import ContextSwitcher from '.'

jest.mock('react-use/lib/useIntersection')
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
  currentUser: {
    defaultOrgUsername: 'spotify',
  },
}

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Switch>
      <Route path="/:provider" exact>
        {children}
      </Route>
    </Switch>
  </MemoryRouter>
)

describe('ContextSwitcher', () => {
  let props
  function setup(over = {}) {
    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    props = {
      ...defaultProps,
      ...over,
    }
  }

  afterEach(() => jest.resetAllMocks())

  describe('when rendered', () => {
    beforeEach(setup)

    it('does not render any link', () => {
      render(<ContextSwitcher {...props} />, {
        wrapper,
      })

      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('when the button is clicked', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the menu', async () => {
      render(<ContextSwitcher {...props} />, {
        wrapper,
      })

      const button = await screen.findByRole('button')
      userEvent.click(button)

      const popover = await screen.findByRole('menu')
      expect(popover).toBeVisible()
    })

    it('renders the orgs', async () => {
      render(<ContextSwitcher {...props} />, {
        wrapper,
      })

      const button = await screen.findByRole('button')
      userEvent.click(button)

      const dorianUsers = await screen.findAllByText('dorianamouroux')
      expect(dorianUsers.length).toBe(2)

      const codecovOwner = await screen.findByText('codecov')
      expect(codecovOwner).toBeInTheDocument()

      const spotifyOwner = await screen.findByText('spotify')
      expect(spotifyOwner).toBeInTheDocument()

      const defaultText = await screen.findByText('Default')
      expect(defaultText).toBeInTheDocument()
    })
  })

  describe('when rendered with no active context', () => {
    beforeEach(() => {
      setup({
        activeContext: null,
      })
    })

    it('renders all orgs and repos', async () => {
      render(<ContextSwitcher {...props} />, {
        wrapper,
      })

      const allOrgsAndRepos = await /all my orgs and repos/i
      expect(screen.getByText(allOrgsAndRepos)).toBeInTheDocument()
    })

    it('renders manage access restrictions', async () => {
      render(<ContextSwitcher {...props} />, {
        wrapper,
      })

      const manageAccess = await screen.findByText(
        /Manage access restrictions/i
      )
      expect(manageAccess).toBeInTheDocument()
    })
  })

  describe('when isLoading is passed', () => {
    describe('isLoading set to true', () => {
      beforeEach(() => setup({ isLoading: true }))
      it('renders spinner', async () => {
        render(<ContextSwitcher {...props} />, {
          wrapper,
        })

        const button = await screen.findByRole('button')
        userEvent.click(button)

        const spinner = await screen.findByTestId('spinner')
        expect(spinner).toBeInTheDocument()
      })
    })
    describe('isLoading set to false', () => {
      beforeEach(() => setup({ isLoading: false }))
      it('does not render spinner', async () => {
        render(<ContextSwitcher {...props} />, {
          wrapper,
        })

        const button = await screen.findByRole('button')
        userEvent.click(button)

        const spinner = screen.queryByTestId('spinner')
        expect(spinner).not.toBeInTheDocument()
      })
    })
  })

  describe('when onLoadMore is passed and is intersecting', () => {
    const onLoadMoreFunc = jest.fn()

    beforeEach(() => {
      setup({ onLoadMore: onLoadMoreFunc })
      useIntersection.mockReturnValue({ isIntersecting: true })
    })
    afterEach(() => jest.restoreAllMocks())

    it('calls onLoadMore', async () => {
      render(<ContextSwitcher {...props} />, {
        wrapper,
      })

      const button = await screen.findByRole('button')
      userEvent.click(button)

      await waitFor(() => expect(onLoadMoreFunc).toHaveBeenCalled())
    })
  })

  describe('when custom component is passed', () => {
    beforeEach(() => {
      setup()
    })
    afterEach(() => jest.restoreAllMocks())

    it('renders the custom component', async () => {
      // disabling as it's a test, happy to make validation for it though
      // eslint-disable-next-line react/prop-types
      const Component = ({ closeFn }) => <div onClick={closeFn}>component</div>
      // eslint-disable-next-line react/prop-types
      const DisplayComponent = ({ onClick }) => (
        <button onClick={onClick}>display</button>
      )
      const customProps = {
        ...props,
        Component,
        DisplayComponent,
      }
      render(<ContextSwitcher {...customProps} />, {
        wrapper,
      })

      const displayComponentButton = await screen.findByText('display')
      expect(displayComponentButton).toBeInTheDocument()
      userEvent.click(displayComponentButton)

      const componentText = await screen.findByText('component')
      expect(componentText).toBeInTheDocument()
      userEvent.click(componentText)

      await waitFor(() => expect(componentText).not.toBeInTheDocument())
    })
  })
})

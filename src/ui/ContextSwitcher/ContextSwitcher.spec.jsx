import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useImage } from 'services/image'

import ContextSwitcher from '.'

jest.mock('react-use/lib/useIntersection')
jest.mock('services/image')

// eslint-disable-next-line react/prop-types
const ModalComponent = ({ closeFn }) => <div onClick={closeFn}>component</div>
// eslint-disable-next-line react/prop-types
const ModalControl = ({ onClick }) => <button onClick={onClick}>display</button>

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/:provider" exact>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    )

describe('ContextSwitcher', () => {
  function setup() {
    const user = userEvent.setup()

    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })

    return { user }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())
    afterEach(() => jest.restoreAllMocks())

    it('does not render any link', () => {
      render(
        <ContextSwitcher
          activeContext="laudna"
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      expect(screen.queryAllByRole('link')).toHaveLength(0)
    })
  })

  describe('when the button is clicked', () => {
    afterEach(() => jest.restoreAllMocks())

    it('renders the menu', async () => {
      const { user } = setup()
      render(
        <ContextSwitcher
          activeContext="laudna"
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const button = await screen.findByRole('button')
      await user.click(button)

      const popover = await screen.findByRole('menu')
      expect(popover).toBeVisible()
    })

    it('renders the orgs', async () => {
      const { user } = setup()
      render(
        <ContextSwitcher
          activeContext="laudna"
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const button = await screen.findByRole('button')
      await user.click(button)

      const dorianUsers = await screen.findAllByText('laudna')
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
    beforeEach(() => setup())
    afterEach(() => jest.restoreAllMocks())

    it('renders all orgs and repos', async () => {
      render(
        <ContextSwitcher
          activeContext={null}
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const allOrgsAndRepos = await /all my orgs and repos/i
      expect(screen.getByText(allOrgsAndRepos)).toBeInTheDocument()
    })

    it('renders manage access restrictions', async () => {
      render(
        <ContextSwitcher
          activeContext="laudna"
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const manageAccess = await screen.findByText(
        /Manage access restrictions/i
      )
      expect(manageAccess).toBeInTheDocument()
    })
  })

  describe('when isLoading is passed', () => {
    describe('isLoading set to true', () => {
      afterEach(() => jest.restoreAllMocks())

      it('renders spinner', async () => {
        const { user } = setup()
        render(
          <ContextSwitcher
            activeContext="laudna"
            contexts={[
              {
                owner: {
                  username: 'laudna',
                  avatarUrl: 'https://github.com/laudna.png?size=40',
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
            ]}
            currentUser={{
              defaultOrgUsername: 'spotify',
            }}
            ModalComponent={ModalComponent}
            ModalControl={ModalControl}
            src="imageUrl"
            isLoading={true}
            error={null}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const button = await screen.findByRole('button')
        await user.click(button)

        const spinner = await screen.findByTestId('spinner')
        expect(spinner).toBeInTheDocument()
      })
    })
    describe('isLoading set to false', () => {
      afterEach(() => jest.restoreAllMocks())

      it('does not render spinner', async () => {
        const { user } = setup()
        render(
          <ContextSwitcher
            activeContext="laudna"
            contexts={[
              {
                owner: {
                  username: 'laudna',
                  avatarUrl: 'https://github.com/laudna.png?size=40',
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
            ]}
            currentUser={{
              defaultOrgUsername: 'spotify',
            }}
            ModalComponent={ModalComponent}
            ModalControl={ModalControl}
            src="imageUrl"
            isLoading={false}
            error={null}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const button = await screen.findByRole('button')
        await user.click(button)

        const spinner = screen.queryByTestId('spinner')
        expect(spinner).not.toBeInTheDocument()
      })
    })
  })

  describe('when onLoadMore is passed and is intersecting', () => {
    beforeEach(() => {
      useIntersection.mockReturnValue({ isIntersecting: true })
    })
    afterEach(() => jest.restoreAllMocks())

    it('calls onLoadMore', async () => {
      const { user } = setup()
      const onLoadMoreFunc = jest.fn()
      render(
        <ContextSwitcher
          activeContext="laudna"
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
          onLoadMore={onLoadMoreFunc}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const button = await screen.findByRole('button')
      await user.click(button)

      expect(onLoadMoreFunc).toHaveBeenCalled()
    })
  })

  describe('when custom component is passed', () => {
    afterEach(() => jest.restoreAllMocks())

    it('renders the custom component', async () => {
      const { user } = setup()
      render(
        <ContextSwitcher
          activeContext="laudna"
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
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
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          ModalComponent={ModalComponent}
          ModalControl={ModalControl}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const modalControlButton = await screen.findByText('display')
      expect(modalControlButton).toBeInTheDocument()
      await user.click(modalControlButton)

      const modalComponentText = await screen.findByText('component')
      expect(modalComponentText).toBeInTheDocument()
      await user.click(modalComponentText)

      await waitFor(() => expect(modalComponentText).not.toBeInTheDocument())
    })
  })
})

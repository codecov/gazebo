import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useImage } from 'services/image'

import ContextSwitcher from './ContextSwitcher'

jest.mock('react-use/lib/useIntersection')
jest.mock('services/image')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/:provider" exact>
            <div>Click away</div>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('ContextSwitcher', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()

    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    server.use(
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
        mutate(req.variables)

        return res(ctx.status(200), ctx.json({ username: 'spotify' }))
      })
    )
    return { user, mutate }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())
    afterEach(() => jest.restoreAllMocks())

    it('does not render the listed items initially', () => {
      render(
        <ContextSwitcher
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
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
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      expect(screen.queryByRole('listbox')).toHaveClass('hidden')
    })
  })

  describe('when the button is clicked', () => {
    afterEach(() => jest.restoreAllMocks())

    it('renders the menu', async () => {
      const { user } = setup()
      render(
        <ContextSwitcher
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
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
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const button = await screen.findByRole('button', { expanded: false })
      await user.click(button)

      const popover = await screen.findByRole('listbox')
      expect(popover).not.toHaveClass('hidden')

      let clickAway = screen.getByText(/Click away/)
      await act(async () => await user.click(clickAway))
      expect(popover).toHaveClass('hidden')

      // Does not open the menu when menu is closed
      clickAway = screen.getByText(/Click away/)
      await act(async () => await user.click(clickAway))
      expect(popover).toHaveClass('hidden')
    })

    it('renders the orgs', async () => {
      const { user } = setup()
      render(
        <ContextSwitcher
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
              },
              pageName: 'owner',
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
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const button = await screen.findByRole(
        'button',
        ('button', { expanded: false })
      )
      await user.click(button)

      const laudnaUsers = await screen.findAllByText('laudna')
      expect(laudnaUsers.length).toBe(2)

      const codecovOwner = await screen.findByText('codecov')
      expect(codecovOwner).toBeInTheDocument()

      const spotifyOwner = await screen.findByText('spotify')
      expect(spotifyOwner).toBeInTheDocument()
    })
  })

  describe('when rendered with no active context', () => {
    beforeEach(() => setup())
    afterEach(() => jest.restoreAllMocks())

    it('renders manage access restrictions', async () => {
      render(
        <ContextSwitcher
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://github.com/laudna.png?size=40',
              },
              pageName: 'owner',
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
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const installCopy = await screen.findByText(/Install Codecov GitHub app/)
      expect(installCopy).toBeInTheDocument()
      expect(installCopy).toHaveAttribute(
        'href',
        'https://github.com/apps/codecov/installations/new'
      )
    })
  })

  describe('when isLoading is passed', () => {
    describe('isLoading set to true', () => {
      afterEach(() => jest.restoreAllMocks())

      it('renders spinner', async () => {
        const { user } = setup()
        render(
          <ContextSwitcher
            activeContext={{
              username: 'laudna',
              avatarUrl: 'http://127.0.0.1/avatar-url',
            }}
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
            src="imageUrl"
            isLoading={true}
            error={null}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const button = await screen.findByRole('button', { expanded: false })
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
            activeContext={{
              username: 'laudna',
              avatarUrl: 'http://127.0.0.1/avatar-url',
            }}
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
            src="imageUrl"
            isLoading={false}
            error={null}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const button = await screen.findByRole('button', { expanded: false })
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
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
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
          src="imageUrl"
          isLoading={false}
          error={null}
          onLoadMore={onLoadMoreFunc}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const button = await screen.findByRole('button', { expanded: false })
      await user.click(button)

      expect(onLoadMoreFunc).toHaveBeenCalled()
    })
  })

  describe('when not on gh provider', () => {
    afterEach(() => jest.restoreAllMocks())

    it('does not render the add github org text', async () => {
      setup()
      render(
        <ContextSwitcher
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
          contexts={[
            {
              owner: {
                username: 'laudna',
                avatarUrl: 'https://bitbucket.com/laudna.png?size=40',
              },
              pageName: 'provider',
            },
          ]}
          currentUser={{
            defaultOrgUsername: 'spotify',
          }}
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper('/bb'),
        }
      )

      const addGhOrgText = screen.queryByText(/Install Codecov GitHub app/)
      expect(addGhOrgText).not.toBeInTheDocument()
    })
  })

  describe('when custom modal component is passed', () => {
    afterEach(() => jest.restoreAllMocks())

    it('renders the modal component', async () => {
      setup()
      render(
        <ContextSwitcher
          activeContext={{
            username: 'laudna',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          }}
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
          src="imageUrl"
          isLoading={false}
          error={null}
        />,
        {
          wrapper: wrapper(),
        }
      )
    })

    describe('when user clicks on an org', () => {
      afterEach(() => jest.restoreAllMocks())

      it('fires update org mutation', async () => {
        const { user, mutate } = setup()
        render(
          <ContextSwitcher
            activeContext={{
              username: 'laudna',
              avatarUrl: 'http://127.0.0.1/avatar-url',
            }}
            contexts={[
              {
                owner: {
                  username: 'laudna',
                  avatarUrl: 'http://127.0.0.1/avatar-url',
                },
                pageName: 'provider',
              },
              {
                owner: {
                  username: 'spotify',
                  avatarUrl: 'http://127.0.0.1/avatar-url',
                },
                pageName: 'owner',
              },
              {
                owner: {
                  username: 'codecov',
                  avatarUrl: 'http://127.0.0.1/avatar-url',
                },
                pageName: 'owner',
              },
            ]}
            currentUser={{
              defaultOrgUsername: 'spotify',
            }}
            src="imageUrl"
            isLoading={false}
            error={null}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const button = await screen.findByRole('button', { expanded: false })
        await user.click(button)

        const orgButton = await screen.findByText('codecov')
        await user.click(orgButton)

        await waitFor(() => {
          expect(mutate).toHaveBeenCalledWith({
            input: {
              username: 'codecov',
            },
          })
        })
      })

      it('does not fire update org mutation if org is already the default', async () => {
        const { user, mutate } = setup()
        render(
          <ContextSwitcher
            activeContext={{
              username: 'laudna',
              avatarUrl: 'http://127.0.0.1/avatar-url',
            }}
            contexts={[
              {
                owner: {
                  username: 'laudna',
                  avatarUrl: 'http://127.0.0.1/avatar-url',
                },
                pageName: 'provider',
              },
              {
                owner: {
                  username: 'spotify',
                  avatarUrl: 'http://127.0.0.1/avatar-url',
                },
                pageName: 'owner',
              },
              {
                owner: {
                  username: 'codecov',
                  avatarUrl: 'http://127.0.0.1/avatar-url',
                },
                pageName: 'owner',
              },
            ]}
            currentUser={{
              defaultOrgUsername: 'codecov',
            }}
            src="imageUrl"
            isLoading={false}
            error={null}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const button = await screen.findByRole('button', { expanded: false })
        await user.click(button)

        const orgButton = await screen.findByText('codecov')
        await user.click(orgButton)

        await waitFor(() => {
          expect(mutate).not.toHaveBeenCalled()
        })
      })
    })
  })
})

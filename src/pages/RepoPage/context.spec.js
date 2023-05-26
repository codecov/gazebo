import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { RepoBreadcrumbProvider, useCrumbs, useSetCrumbs } from './context'

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
      <Route path="/:provider/:owner/:repo">
        <Suspense fallback={null}>
          <RepoBreadcrumbProvider>{children}</RepoBreadcrumbProvider>
        </Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const TestComponent = () => {
  const crumbs = useCrumbs()
  const setCrumb = useSetCrumbs()

  return (
    <div>
      <ul>
        {crumbs.map(({ text, children }, i) => (
          <li key={i}>{text || children}</li>
        ))}
      </ul>
      <button
        onClick={() => {
          setCrumb([{ pageName: 'added', text: 'added' }])
        }}
      >
        set crumb
      </button>
    </div>
  )
}

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('Repo breadcrumb context', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                private: false,
              },
            },
          })
        )
      )
    )

    return { user }
  }
  describe('when called', () => {
    it('crumbs return the owner and repo value', async () => {
      setup()
      render(<TestComponent />, { wrapper })

      expect(await screen.findByText('codecov')).toBeTruthy()
      const codecov = screen.getByText('codecov')
      expect(codecov).toBeInTheDocument()

      expect(await screen.findByText('test-repo')).toBeTruthy()
      const testRepo = screen.getByText('test-repo')
      expect(testRepo).toBeInTheDocument()
    })

    it('setCrumb can update the context', async () => {
      const { user } = setup()
      render(<TestComponent />, { wrapper })

      expect(
        await screen.findByRole('button', { name: 'set crumb' })
      ).toBeTruthy()
      const button = screen.getByRole('button', { name: 'set crumb' })
      await user.click(button)

      expect(await screen.findByText('added')).toBeTruthy()
      const text = screen.getByText('added')
      expect(text).toBeInTheDocument()
    })
  })
})

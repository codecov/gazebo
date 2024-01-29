import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OtherCIOrgToken from './OtherCIOrgToken'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/new/other-ci']}>
      <Route
        path={[
          '/:provider/:owner/:repo/new',
          '/:provider/:owner/:repo/new/other-ci',
        ]}
      >
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('OtherCIOrgToken', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { orgUploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629290' },
          })
        )
      })
    )

    return { user }
  }

  describe('step one', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const header = await screen.findByText(/Step 1/)
      expect(header).toBeInTheDocument()
    })

    it('renders token box', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const codecovToken = await screen.findByText(/CODECOV_TOKEN/)
      expect(codecovToken).toBeInTheDocument()

      const tokenValue = await screen.findAllByText(
        /9e6a6189-20f1-482d-ab62-ecfaa2629290/
      )
      expect(tokenValue).toHaveLength(2)
    })
  })

  describe('step two', () => {
    it('renders header', async () => {
      setup()
      render(<OtherCIOrgToken />, { wrapper })

      const header = await screen.findByText(/Step 2/)
      expect(header).toBeInTheDocument()

      const headerLink = await screen.findByRole('link', {
        name: /uploader to your/,
      })
      expect(headerLink).toBeInTheDocument()
      expect(headerLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-uploader'
      )
    })

    it('renders instruction box', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const box = await screen.findByTestId('instruction-box')
      expect(box).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup())
    it('renders header', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const header = await screen.findByText(/Step 3/)
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const body = await screen.findByText(/upload coverage to Codecov via /)
      expect(body).toBeInTheDocument()
    })

    it('renders command box', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const box = await screen.findByText(/codecovcli upload-process/)
      expect(box).toBeInTheDocument()
    })
  })

  describe('step four', () => {
    beforeEach(() => setup())
    it('renders body', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const title = await screen.findByText(/Once merged to the default branch/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('ending', () => {
    beforeEach(() => setup())
    it('renders body', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const body = await screen.findByText(/How was your setup experience/)
      expect(body).toBeInTheDocument()

      const bodyLink = await screen.findByRole('link', { name: /this issue/ })
      expect(bodyLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/Codecov-user-feedback/issues/18'
      )
    })
  })
})

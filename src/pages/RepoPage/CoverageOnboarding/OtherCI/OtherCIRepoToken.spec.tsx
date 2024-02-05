import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OtherCIRepoToken from './OtherCIRepoToken'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
    },
  },
}

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

describe('OtherCI', () => {
  function setup() {
    const user = userEvent.setup()
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      )
    )

    return { user }
  }

  describe('step one', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<OtherCIRepoToken />, { wrapper })

      const header = await screen.findByText(/Step 1/)
      expect(header).toBeInTheDocument()
    })

    it('renders token box', async () => {
      render(<OtherCIRepoToken />, { wrapper })

      const codecovToken = await screen.findByText(/CODECOV_TOKEN/)
      expect(codecovToken).toBeInTheDocument()

      const tokenValue = await screen.findByText(
        /9e6a6189-20f1-482d-ab62-ecfaa2629295/
      )
      expect(tokenValue).toBeInTheDocument()
    })
  })

  describe('step two', () => {
    it('renders header', async () => {
      setup()
      render(<OtherCIRepoToken />, { wrapper })

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
      render(<OtherCIRepoToken />, { wrapper })

      const box = await screen.findByTestId('instruction-box')
      expect(box).toBeInTheDocument()
    })

    it('renders integrity check msg', async () => {
      render(<OtherCIRepoToken />, { wrapper })

      const integrityCheck = await screen.findByText(/It is highly recommended/)
      expect(integrityCheck).toBeInTheDocument()

      const integrityCheckLink = await screen.findByRole('link', {
        name: /integrity check/,
      })
      expect(integrityCheckLink).toBeInTheDocument()
      expect(integrityCheckLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-uploader#integrity-checking-the-uploader'
      )
    })
  })

  describe('step three', () => {
    beforeEach(() => setup())
    it('renders first body', async () => {
      render(<OtherCIRepoToken />, { wrapper })

      const body = await screen.findByText(/After you committed your changes/)
      expect(body).toBeInTheDocument()
    })

    it('renders status check image', async () => {
      render(<OtherCIRepoToken />, { wrapper })

      const img = await screen.findByRole('img', {
        name: 'codecov patch and project',
      })
      expect(img).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<OtherCIRepoToken />, { wrapper })

      const title = await screen.findByText(/Once merged to the default branch/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('ending', () => {
    beforeEach(() => setup())
    it('renders body', async () => {
      render(<OtherCIRepoToken />, { wrapper })

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

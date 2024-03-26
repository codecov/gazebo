import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OtherCIOrgToken from './OtherCIOrgToken'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629290',
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
    },
  },
}

const mockGetOrgUploadToken = (hasOrgUploadToken: boolean | null) => ({
  owner: {
    orgUploadToken: hasOrgUploadToken
      ? '9e6a6189-20f1-482d-ab62-ecfaa2629290'
      : null,
  },
})

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
  function setup(hasOrgUploadToken: boolean | null = true) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockGetOrgUploadToken(hasOrgUploadToken))
        )
      })
    )

    return { user }
  }

  describe('intro blurb', () => {
    beforeEach(() => setup())

    it('renders intro blurb', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const blurb = await screen.findByTestId('intro-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step one', () => {
    describe('when org has upload token', () => {
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

      it('renders global token copy', async () => {
        render(<OtherCIOrgToken />, { wrapper })

        const repoToken = await screen.findByText(/global token/)
        expect(repoToken).toBeInTheDocument()
      })

      describe('when org does not have global upload token', () => {
        beforeEach(() => setup(false))

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
            /9e6a6189-20f1-482d-ab62-ecfaa2629295/
          )
          expect(tokenValue).toHaveLength(2)
        })

        it('renders repository token copy', async () => {
          render(<OtherCIOrgToken />, { wrapper })

          const repoToken = await screen.findByText(/repository token/)
          expect(repoToken).toBeInTheDocument()
        })
      })
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

    it('renders example blurb', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    describe('when org has upload token', () => {
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

      it('renders -r flag when org upload token exists', async () => {
        render(<OtherCIOrgToken />, { wrapper })

        const box = await screen.findByText(/-r cool-repo/)
        expect(box).toBeInTheDocument()
      })
    })

    describe('when org does not have org upload token', () => {
      beforeEach(() => setup(false))

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

      it('does not render -r flag when org upload token does not exist', async () => {
        render(<OtherCIOrgToken />, { wrapper })

        const box = screen.queryByText(/-r cool-repo/)
        expect(box).not.toBeInTheDocument()
      })
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
    it('renders quick start link', async () => {
      render(<OtherCIOrgToken />, { wrapper })

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
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

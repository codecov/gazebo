import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OtherCI from './OtherCI'

const mockGetRepo = {
  owner: {
    isAdmin: null,
    isCurrentUserPartOfOrg: true,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: 'repo-token-jkl;-7890',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
      isFirstPullRequest: false,
    },
  },
}

const mockGetOrgUploadToken = {
  owner: {
    orgUploadToken: 'org-token-asdf-1234',
  },
}

const mockNoUploadToken = {
  owner: {
    orgUploadToken: null,
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
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

interface SetupArgs {
  hasOrgUploadToken?: boolean
}

describe('OtherCI', () => {
  function setup({ hasOrgUploadToken = false }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepo', () => {
        return HttpResponse.json({ data: mockGetRepo })
      }),
      graphql.query('GetOrgUploadToken', () => {
        return HttpResponse.json({
          data: hasOrgUploadToken ? mockGetOrgUploadToken : mockNoUploadToken,
        })
      })
    )

    return { user }
  }

  describe('output coverage step', () => {
    it('renders header', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const header = await screen.findByText(
        /Step \d: Output a Coverage report file in your CI/
      )
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const body = await screen.findByText(/Select your language below/)
      expect(body).toBeInTheDocument()

      const jest = await screen.findByText(/Jest/)
      expect(jest).toBeInTheDocument()
    })
  })

  describe('token step', () => {
    it('renders header', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const header = await screen.findByText(
        /Step \d: add repository token as a secret to your CI Provider/
      )
      expect(header).toBeInTheDocument()
    })

    describe('when org has upload token', () => {
      it('renders global token copy', async () => {
        setup({ hasOrgUploadToken: true })
        render(<OtherCI />, { wrapper })

        const repoToken = await screen.findByText(/global token/)
        expect(repoToken).toBeInTheDocument()
      })

      it('renders token box', async () => {
        setup({ hasOrgUploadToken: true })
        render(<OtherCI />, { wrapper })

        const tokenValue = await screen.findByText('org-token-asdf-1234')
        expect(tokenValue).toBeInTheDocument()
      })
    })

    describe('when org does not have global upload token', () => {
      it('renders repository token copy', async () => {
        setup({})
        render(<OtherCI />, { wrapper })

        const repoToken = await screen.findByText(/repository token/)
        expect(repoToken).toBeInTheDocument()
      })

      it('renders token box', async () => {
        setup({})
        render(<OtherCI />, { wrapper })

        const codecovToken = await screen.findByText(/CODECOV_TOKEN/)
        expect(codecovToken).toBeInTheDocument()

        const tokenValue = await screen.findAllByText(/repo-token-jkl;-7890/)
        expect(tokenValue).toHaveLength(1)
      })
    })
  })

  describe('install step', () => {
    beforeEach(() => setup({}))
    it('renders header', async () => {
      render(<OtherCI />, { wrapper })

      const header = await screen.findByText(/Step \d: add the/)
      expect(header).toBeInTheDocument()

      const headerLink = await screen.findByRole('link', {
        name: /Codecov CLI/,
      })
      expect(headerLink).toBeInTheDocument()
      expect(headerLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-uploader'
      )
    })

    it('renders example blurb', async () => {
      render(<OtherCI />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('upload step', () => {
    it('renders header', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const header = await screen.findByText(
        /Step \d: upload coverage to Codecov via the CLI after your tests have run/
      )
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const body = await screen.findByText(/upload coverage to Codecov via /)
      expect(body).toBeInTheDocument()
    })

    it('renders command box', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const box = await screen.findByText(/upload-process/)
      expect(box).toBeInTheDocument()
    })

    describe('when org has upload token', () => {
      it('renders -r flag', async () => {
        setup({ hasOrgUploadToken: true })
        render(<OtherCI />, { wrapper })

        const box = await screen.findByText(/-r codecov\/cool-repo/)
        expect(box).toBeInTheDocument()
      })
    })

    describe('when org does not have org upload token', () => {
      it('does not render -r flag', async () => {
        setup({})
        render(<OtherCI />, { wrapper })

        const box = screen.queryByText(/-r codecov\/cool-repo/)
        expect(box).not.toBeInTheDocument()
      })
    })

    it('renders instruction box', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const box = await screen.findByTestId('instruction-box')
      expect(box).toBeInTheDocument()
    })
  })

  describe('merge step', () => {
    beforeEach(() => setup({}))
    it('renders header', async () => {
      render(<OtherCI />, { wrapper })

      const header = await screen.findByText(
        /Step \d: merge to main or your preferred feature branch/
      )
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      render(<OtherCI />, { wrapper })

      const body = await screen.findByText(
        /Once merged to your default branch,/
      )
      expect(body).toBeInTheDocument()
    })
  })

  describe('feedback CTA', () => {
    it('renders feedback link', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const body = await screen.findByText(/How was your setup experience/)
      expect(body).toBeInTheDocument()

      const bodyLink = await screen.findByRole('link', { name: /this issue/ })
      expect(bodyLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/Codecov-user-feedback/issues/18'
      )
    })
  })

  describe('learn more blurb', () => {
    it('renders body', async () => {
      setup({})
      render(<OtherCI />, { wrapper })

      const body = await screen.findByText(/Visit our guide to/)
      expect(body).toBeInTheDocument()

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
  })
})

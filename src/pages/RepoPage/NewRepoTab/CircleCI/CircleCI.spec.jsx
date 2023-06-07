import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { trackSegmentEvent } from 'services/tracking/segment'

import CircleCI from './CircleCI'

jest.mock('services/tracking/segment')

const mockCurrentUser = {
  me: {
    trackingMetadata: {
      ownerid: 'user-owner-id',
    },
  },
}

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
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/new']}>
      <Route
        path={[
          '/:provider/:owner/:repo/new',
          '/:provider/:owner/:repo/new/circle-ci',
        ]}
      >
        <Suspense fallback={null}>{children}</Suspense>
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

describe('CircleCI', () => {
  function setup() {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      ),
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCurrentUser))
      )
    )

    trackSegmentEvent.mockImplementation((data) => data)
  }

  describe('step one', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<CircleCI />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 1/ })
      expect(header).toBeInTheDocument()

      const environmentVariableLink = await screen.findByRole('link', {
        name: /environment variables/,
      })
      expect(environmentVariableLink).toBeInTheDocument()
      expect(environmentVariableLink).toHaveAttribute(
        'href',
        'https://app.circleci.com/settings/project/github/codecov/cool-repo/environment-variables'
      )
    })

    describe('user copies token', () => {
      it('fires segment event', async () => {
        const user = userEvent.setup()
        render(<CircleCI />, { wrapper })

        // this is needed to wait for all the data to be loaded
        const tokenValue = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629295/
        )
        expect(tokenValue).toBeInTheDocument()

        const buttons = await screen.findAllByTestId('clipboard')
        const button = buttons[0]

        await user.click(button)

        expect(trackSegmentEvent).toBeCalled()
        expect(trackSegmentEvent).toBeCalledWith({
          data: {
            category: 'Onboarding',
            tokenHash: 'a2629295',
            userId: 'user-owner-id',
          },
          event: 'User Onboarding Copied CI Token',
        })
      })
    })
  })

  describe('step two', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<CircleCI />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()

      const CircleCIWorkflowLink = await screen.findByRole('link', {
        name: /config.yml/,
      })
      expect(CircleCIWorkflowLink).toBeInTheDocument()
      expect(CircleCIWorkflowLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/tree/main/.circleci/config'
      )
    })

    it('renders yaml section', async () => {
      render(<CircleCI />, { wrapper })

      const yamlBox = await screen.findByText(
        /Add the following to your .circleci\/config.yaml and push changes to repository./
      )
      expect(yamlBox).toBeInTheDocument()
    })

    it('renders yaml code', async () => {
      render(<CircleCI />, { wrapper })

      const yamlCode = await screen.findByText(/codecov\/codecov@3.2.4/)
      expect(yamlCode).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup())
    it('renders first body', async () => {
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(/After you committed your changes/)
      expect(body).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(/Once merged to the/)
      expect(body).toBeInTheDocument()
    })

    it('renders status check image', async () => {
      render(<CircleCI />, { wrapper })

      const img = await screen.findByRole('img', {
        name: 'codecov patch and project',
      })
      expect(img).toBeInTheDocument()
    })
  })

  describe('ending', () => {
    beforeEach(() => setup())
    it('renders body', async () => {
      render(<CircleCI />, { wrapper })

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

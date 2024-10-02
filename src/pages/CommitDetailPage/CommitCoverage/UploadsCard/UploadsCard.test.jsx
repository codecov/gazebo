import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import UploadsCard from './UploadsCard'

const mocks = vi.hoisted(() => ({
  useCommitErrors: vi.fn(),
  useUploads: vi.fn(),
}))

vi.mock('./useUploads', async () => {
  const actual = await vi.importActual('./useUploads')
  return {
    ...actual,
    useUploads: mocks.useUploads,
  }
})
vi.mock('services/commitErrors', async () => {
  const actual = await vi.importActual('services/commitErrors')
  return {
    ...actual,
    useCommitErrors: mocks.useCommitErrors,
  }
})

vi.mock('../YamlModal/YamlModalErrorBanner', () => ({
  default: () => 'YamlModalErrorBanner',
}))

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
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/1234']}>
      <Route path="/:provider/:owner/:repo/:commit">{children}</Route>
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
describe('UploadsCard', () => {
  function setup(mockUploads) {
    mocks.useUploads.mockReturnValue(mockUploads)
    mocks.useCommitErrors.mockReturnValue({
      data: { yamlErrors: [], botErrors: [] },
    })

    server.use(
      graphql.query('CommitYaml', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                commit: {
                  commitid: 'asdf',
                  yaml: 'yada yada',
                },
              },
            },
          },
        })
      })
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: ['travis', 'circleci', 'null'],
        uploadsOverview: 'uploads overview',
        groupedUploads: {
          travis: [
            {
              id: 0,
              state: 'PROCESSED',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
              uploadType: 'uploaded',
              jobCode: '721065746',
              buildCode: '721065746',
            },
            {
              id: 1,
              state: 'PROCESSED',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              flags: ['flagOne'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
              uploadType: 'uploaded',
              jobCode: '721065763',
              buildCode: '721065763',
            },
          ],
          circleci: [
            {
              id: 2,
              state: 'PROCESSED',
              provider: 'circleci',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'uploaded',
              jobCode: '111111',
              buildCode: '111111',
            },
            {
              id: 3,
              state: 'COMPLETE',
              provider: 'circleci',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'CARRIEDFORWARD',
              jobCode: '837462',
              buildCode: '837462',
            },
          ],
          null: [
            {
              state: 'PROCESSED',
              provider: 'null',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'uploaded',
              jobCode: '33333',
              buildCode: '33333',
            },
          ],
        },
        hasNoUploads: false,
      })
    })

    it('renders the title', () => {
      render(<UploadsCard />, { wrapper })

      const uploads = screen.getByText(/Uploads/)
      expect(uploads).toBeInTheDocument()
    })
    it('renders different cis', () => {
      render(<UploadsCard />, { wrapper })

      const circleci = screen.getByText(/circleci/)
      expect(circleci).toBeInTheDocument()
      const travis = screen.getByText(/travis/)
      expect(travis).toBeInTheDocument()
    })
    it('renders build ids', () => {
      render(<UploadsCard />, { wrapper })

      const id1 = screen.getByText(/111111/)
      expect(id1).toBeInTheDocument()
      const id2 = screen.getByText(/721065763/)
      expect(id2).toBeInTheDocument()
      const id3 = screen.getByText(/721065746/)
      expect(id3).toBeInTheDocument()
      const id4 = screen.getByText(/837462/)
      expect(id4).toBeInTheDocument()
      const id5 = screen.getByText(/837462/)
      expect(id5).toBeInTheDocument()
    })
    it('renders flags', () => {
      render(<UploadsCard />, { wrapper })

      const flagOne = screen.getByText(/flagOne/)
      expect(flagOne).toBeInTheDocument()
    })

    it('does not render none as an upload provider label', () => {
      render(<UploadsCard />, { wrapper })

      const noneText = screen.queryByText(/none/)
      expect(noneText).not.toBeInTheDocument()
    })
  })
  describe('renders no Uploads', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: [],
        uploadsOverview: '',
        groupedUploads: {},
        hasNoUploads: true,
      })
    })

    it('renders the title', () => {
      render(<UploadsCard />, { wrapper })

      const uploads = screen.getByText(/Uploads/)
      expect(uploads).toBeInTheDocument()
    })
    it('renders different cis', () => {
      render(<UploadsCard />, { wrapper })

      const currentlyNoUploads = screen.getByText(/Currently no uploads/)
      expect(currentlyNoUploads).toBeInTheDocument()
    })
  })
  describe('renders empty Uploads', () => {
    // ??
    beforeEach(() => {
      setup({
        uploadsProviderList: [],
        uploadsOverview: '',
        groupedUploads: {},
        hasNoUploads: false,
      })
    })

    it('renders the title', () => {
      render(<UploadsCard />, { wrapper })

      const uploads = screen.getByText(/Uploads/)
      expect(uploads).toBeInTheDocument()
    })
  })
  describe('The yaml viewer', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: [],
        uploadsOverview: '',
        groupedUploads: {},
        hasNoUploads: false,
      })
    })
    it('opens & close YAMl modal', async () => {
      const user = userEvent.setup()
      render(<UploadsCard />, { wrapper })

      let viewYamlButton = screen.getByText('view YAML file')
      await user.click(viewYamlButton)

      const includesDefaultYaml = await screen.findByText(
        'Includes default YAML, global YAML, and repo'
      )
      expect(includesDefaultYaml).toBeInTheDocument()

      viewYamlButton = screen.getByText('view YAML file')
      await user.click(viewYamlButton)

      let closeBtn = screen.getByLabelText('Close')
      await user.click(closeBtn)

      closeBtn = screen.queryByLabelText('Close')
      expect(closeBtn).not.toBeInTheDocument()
    })
  })
})

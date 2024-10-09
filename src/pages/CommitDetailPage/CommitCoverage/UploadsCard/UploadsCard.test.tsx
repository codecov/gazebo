import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import UploadsCard from './UploadsCard'
import { useUploads } from './useUploads'

const mocks = vi.hoisted(() => ({
  useUploads: vi.fn(),
  useCommitErrors: vi.fn(),
}))

vi.mock('../YamlModal/YamlModalErrorBanner', () => ({
  default: () => 'YamlModalErrorBanner',
}))
vi.mock('./useUploads', async () => mocks)
vi.mock('services/commitErrors', async () => mocks)

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
  vi.clearAllMocks()
})
afterAll(() => server.close())
describe('UploadsCard', () => {
  function setup(mockUploads: ReturnType<typeof useUploads>) {
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
              name: null,
              state: 'PROCESSED',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
              uploadType: 'UPLOADED',
              jobCode: '721065746',
              buildCode: '721065746',
              errors: [],
            },
            {
              id: 1,
              name: null,
              state: 'PROCESSED',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              flags: ['flagOne'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
              uploadType: 'UPLOADED',
              jobCode: '721065763',
              buildCode: '721065763',
              errors: [],
            },
          ],
          circleci: [
            {
              id: 2,
              name: null,
              state: 'PROCESSED',
              provider: 'circleci',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'UPLOADED',
              jobCode: '111111',
              buildCode: '111111',
              errors: [],
            },
            {
              id: 3,
              name: null,
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
              errors: [],
            },
          ],
          null: [
            {
              id: 4,
              state: 'PROCESSED',
              name: null,
              provider: 'null',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'UPLOADED',
              jobCode: '33333',
              buildCode: '33333',
              errors: [],
            },
          ],
        },
        erroredUploads: {},
        flagErrorUploads: {},
        searchResults: [],
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
        erroredUploads: {},
        flagErrorUploads: {},
        searchResults: [],
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
        erroredUploads: {},
        flagErrorUploads: {},
        searchResults: [],
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
        erroredUploads: {},
        flagErrorUploads: {},
        searchResults: [],
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

      const closeBtn = screen.getByLabelText('Close')
      await user.click(closeBtn)

      await waitFor(() => expect(closeBtn).not.toBeInTheDocument())
    })
  })

  describe('search and filter', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: ['travis', 'circleci', 'null'],
        uploadsOverview: 'uploads overview',
        groupedUploads: {
          travis: [
            {
              id: 0,
              state: 'ERROR',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
              uploadType: 'UPLOADED',
              jobCode: '721065746',
              buildCode: '721065746',
              name: 'asdf',
              errors: [],
            },
            {
              id: 1,
              state: 'PROCESSED',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              flags: ['flagOne', 'flagTwo'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
              uploadType: 'UPLOADED',
              jobCode: '721065763',
              buildCode: '721065763',
              name: 'bnm,',
              errors: [],
            },
          ],
          circleci: [
            {
              id: 2,
              state: 'ERROR',
              provider: 'circleci',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: ['flagOne', 'flagTwo'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'UPLOADED',
              jobCode: '111111',
              buildCode: '111111',
              name: 'cvbn',
              errors: [],
            },
            {
              id: 3,
              state: 'ERROR',
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
              name: 'dfgh',
              errors: [],
            },
          ],
          null: [
            {
              id: 4,
              state: 'PROCESSED',
              provider: 'null',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'UPLOADED',
              jobCode: '33333',
              buildCode: '33333',
              name: 'asdfasdf',
              errors: [],
            },
          ],
        },
        erroredUploads: {
          travis: [
            {
              id: 0,
              state: 'ERROR',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
              uploadType: 'UPLOADED',
              jobCode: '721065746',
              buildCode: '721065746',
              name: 'asdf',
              errors: [],
            },
          ],
          circleci: [
            {
              id: 2,
              state: 'ERROR',
              provider: 'circleci',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: ['flagOne', 'flagTwo'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'UPLOADED',
              jobCode: '111111',
              buildCode: '111111',
              name: 'cvbn',
              errors: [],
            },
            {
              id: 3,
              state: 'ERROR',
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
              name: 'dfgh',
              errors: [],
            },
          ],
        },
        flagErrorUploads: {
          travis: [
            {
              id: 1,
              state: 'PROCESSED',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              flags: ['flagOne', 'flagTwo'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
              uploadType: 'UPLOADED',
              jobCode: '721065763',
              buildCode: '721065763',
              name: 'bnm,',
              errors: [],
            },
          ],
          circleci: [
            {
              id: 2,
              state: 'ERROR',
              provider: 'circleci',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: ['flagOne', 'flagTwo'],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/111111',
              uploadType: 'UPLOADED',
              jobCode: '111111',
              buildCode: '111111',
              name: 'cvbn',
              errors: [],
            },
          ],
        },
        searchResults: [
          {
            id: 0,
            state: 'ERROR',
            provider: 'travis',
            createdAt: '2020-08-25T16:36:19.559474+00:00',
            updatedAt: '2020-08-25T16:36:19.679868+00:00',
            flags: [],
            downloadUrl:
              '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
            ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
            uploadType: 'UPLOADED',
            jobCode: '721065746',
            buildCode: '721065746',
            name: 'asdf',
            errors: [],
          },
        ],
        hasNoUploads: false,
      })
    })

    it('shows search and filter controls', async () => {
      render(<UploadsCard />, { wrapper })

      const flagErrors = await screen.findByText('2 flag errors')
      expect(flagErrors).toBeInTheDocument()
      const uploadErrors = await screen.findByText('3 upload errors')
      expect(uploadErrors).toBeInTheDocument()

      const searchBox = await screen.findByText('Search by upload or flag name')
      expect(searchBox).toBeInTheDocument()

      const clearFilters = screen.queryByRole('button', {
        name: 'clear all filters',
      })
      expect(clearFilters).not.toBeInTheDocument()
    })

    it('should filter by flag errors', async () => {
      const user = userEvent.setup()
      render(<UploadsCard />, { wrapper })

      const flagErrors = await screen.findByText('2 flag errors')
      expect(flagErrors).toBeInTheDocument()

      const filterButton = await screen.findByTestId('flag-errors-filter')
      expect(filterButton).toBeInTheDocument()
      expect(filterButton).toHaveTextContent('view')

      expect(
        screen.queryByRole('button', { name: 'clear all filters' })
      ).not.toBeInTheDocument()

      await user.click(filterButton)

      expect(filterButton).toHaveTextContent('clear')
      expect(
        await screen.findByRole('button', { name: 'clear all filters' })
      ).toBeInTheDocument()
      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: true,
          uploadErrors: false,
          searchTerm: '',
        },
      })
    })

    it('should clear flag errors filter', async () => {
      const user = userEvent.setup()
      render(<UploadsCard />, { wrapper })

      const flagErrors = await screen.findByText('2 flag errors')
      expect(flagErrors).toBeInTheDocument()

      const filterButton = await screen.findByTestId('flag-errors-filter')
      expect(filterButton).toBeInTheDocument()
      expect(filterButton).toHaveTextContent('view')

      await user.click(filterButton)

      expect(filterButton).toHaveTextContent('clear')
      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: true,
          uploadErrors: false,
          searchTerm: '',
        },
      })

      vi.clearAllMocks()

      await user.click(filterButton)

      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: false,
          uploadErrors: false,
          searchTerm: '',
        },
      })
    })

    it('should filter by upload errors', async () => {
      const user = userEvent.setup()
      render(<UploadsCard />, { wrapper })

      const uploadErrors = await screen.findByText('3 upload errors')
      expect(uploadErrors).toBeInTheDocument()

      const filterButton = await screen.findByTestId('upload-errors-filter')
      expect(filterButton).toBeInTheDocument()
      expect(filterButton).toHaveTextContent('view')

      expect(
        screen.queryByRole('button', { name: 'clear all filters' })
      ).not.toBeInTheDocument()

      await user.click(filterButton)

      expect(filterButton).toHaveTextContent('clear')
      expect(
        await screen.findByRole('button', { name: 'clear all filters' })
      ).toBeInTheDocument()
      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: false,
          uploadErrors: true,
          searchTerm: '',
        },
      })
    })

    it('should clear upload errors filter', async () => {
      const user = userEvent.setup()
      render(<UploadsCard />, { wrapper })

      const uploadErrors = await screen.findByText('3 upload errors')
      expect(uploadErrors).toBeInTheDocument()

      const filterButton = await screen.findByTestId('upload-errors-filter')
      expect(filterButton).toBeInTheDocument()
      expect(filterButton).toHaveTextContent('view')

      await user.click(filterButton)

      expect(filterButton).toHaveTextContent('clear')

      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: false,
          uploadErrors: true,
          searchTerm: '',
        },
      })

      vi.clearAllMocks()

      await user.click(filterButton)

      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: false,
          uploadErrors: false,
          searchTerm: '',
        },
      })
    })

    it('should filter by search term', async () => {
      const user = userEvent.setup()
      render(<UploadsCard />, { wrapper })

      const searchField = await screen.findByText(
        'Search by upload or flag name'
      )
      expect(searchField).toBeInTheDocument()

      expect(
        screen.queryByRole('button', { name: 'clear all filters' })
      ).not.toBeInTheDocument()

      await user.type(searchField, 'asdf')

      expect(
        await screen.findByRole('button', { name: 'clear all filters' })
      ).toBeInTheDocument()
      expect(mocks.useUploads).toHaveBeenCalledWith({
        filters: {
          flagErrors: false,
          uploadErrors: false,
          searchTerm: 'asdf',
        },
      })
    })

    describe('when searching', () => {
      it('should only show search results', async () => {
        const user = userEvent.setup()
        render(<UploadsCard />, { wrapper })

        const searchField = await screen.findByText(
          'Search by upload or flag name'
        )
        expect(searchField).toBeInTheDocument()

        let searchResult = await screen.findByText('asdf')
        expect(searchResult).toBeInTheDocument()

        const notSearchResult = await screen.findByText('cvbn')
        expect(notSearchResult).toBeInTheDocument()

        await user.type(searchField, 'a')

        await waitForElementToBeRemoved(notSearchResult)

        searchResult = await screen.findByText('asdf')
        expect(searchResult).toBeInTheDocument()
      })
    })

    describe('when clear all filters is clicked', () => {
      it('should clear all filters', async () => {
        const user = userEvent.setup()
        render(<UploadsCard />, { wrapper })

        const flagErrors = await screen.findByTestId('flag-errors-filter')
        expect(flagErrors).toBeInTheDocument()

        await user.click(flagErrors)

        const uploadErrors = await screen.findByTestId('upload-errors-filter')
        expect(uploadErrors).toBeInTheDocument()

        await user.click(uploadErrors)

        const searchBox = await screen.findByText(
          'Search by upload or flag name'
        )
        expect(searchBox).toBeInTheDocument()

        await user.type(searchBox, 'asdf')

        await waitFor(() =>
          expect(mocks.useUploads).toHaveBeenCalledWith({
            filters: {
              flagErrors: true,
              uploadErrors: true,
              searchTerm: 'asdf',
            },
          })
        )

        const clearFilters = await screen.findByRole('button', {
          name: 'clear all filters',
        })
        expect(clearFilters).toBeInTheDocument()

        vi.clearAllMocks()

        expect(mocks.useUploads).not.toHaveBeenCalledWith({
          filters: {
            flagErrors: false,
            uploadErrors: false,
            searchTerm: '',
          },
        })

        await user.click(clearFilters)

        expect(mocks.useUploads).toHaveBeenCalledWith({
          filters: {
            flagErrors: false,
            uploadErrors: false,
            searchTerm: '',
          },
        })
      })
    })
  })
})

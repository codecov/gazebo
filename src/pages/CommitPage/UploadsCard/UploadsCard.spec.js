import { render, screen, fireEvent } from 'custom-testing-library'

import { useUploads } from './hooks'
import UploadsCard from './UploadsCard'

jest.mock('./hooks')

describe('UploadsCard', () => {
  function setup(mockUploads) {
    useUploads.mockReturnValue(mockUploads)
    render(<UploadsCard />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: ['travis', 'circleci'],
        uploadsOverview: 'uploads overview',
        sortedUploads: {
          travis: [
            {
              state: 'processed',
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
              state: 'processed',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              flags: ['flagone'],
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
              state: 'processed',
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
          ],
        },
        hasNoUploads: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/Uploads/)).toBeInTheDocument()
    })
    it('renders different cis', () => {
      expect(screen.getByText(/circleci/)).toBeInTheDocument()
      expect(screen.getByText(/travis/)).toBeInTheDocument()
    })
    it('renders build ids', () => {
      expect(screen.getByText(/111111/)).toBeInTheDocument()
      expect(screen.getByText(/721065763/)).toBeInTheDocument()
      expect(screen.getByText(/721065746/)).toBeInTheDocument()
    })
    it('renders flags', () => {
      expect(screen.getByText(/flagone/)).toBeInTheDocument()
    })
  })
  describe('renders no Uploads', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: [],
        uploadsOverview: '',
        sortedUploads: {},
        hasNoUploads: true,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/Uploads/)).toBeInTheDocument()
    })
    it('renders different cis', () => {
      expect(screen.getByText(/Currently no uploads/)).toBeInTheDocument()
    })
  })
  describe('renders empty Uploads', () => {
    // ??
    beforeEach(() => {
      setup({
        uploadsProviderList: [],
        uploadsOverview: '',
        sortedUploads: {},
        hasNoUploads: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/Uploads/)).toBeInTheDocument()
    })
  })
  describe('The yaml viewer', () => {
    beforeEach(() => {
      setup({
        uploadsProviderList: [],
        uploadsOverview: '',
        sortedUploads: {},
        hasNoUploads: false,
      })
    })
    it('opens & close YAMl modal', () => {
      fireEvent.click(screen.getByText('view yml file'))
      expect(
        screen.getByText('Includes default yaml, global yaml, and repo')
      ).toBeInTheDocument()
      fireEvent.click(screen.getByText('view yml file'))
      fireEvent.click(screen.getByLabelText('Close'))
    })
  })
})

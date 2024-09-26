import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'

import Upload from './Upload'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[
        '/gh/codecov/codecov-api/commit/a758cb364d190e9677ae2a3dd3b2af7690971624',
      ]}
    >
      <Route path="/gh/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

afterEach(() => {
  queryClient.clear()
})

describe('UploadsCard', () => {
  describe('renders', () => {
    let props
    beforeEach(() => {
      props = {
        ciUrl: 'ciUrl.com',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        downloadUrl: 'download.com',
        buildCode: '1234',
        uploadType: 'CARRIEDFORWARD',
      }
    })

    it('renders the build code', () => {
      render(<Upload {...props} />, { wrapper })

      const buildCode = screen.getByText(/1234/)
      expect(buildCode).toBeInTheDocument()
    })

    it('link to the build', () => {
      render(<Upload {...props} />, { wrapper })

      const buildLink = screen.getByRole('link', { name: /1234/ })
      expect(buildLink).toHaveAttribute('href', 'ciUrl.com')
    })

    it('created at dates', () => {
      render(<Upload {...props} />, { wrapper })

      // If we dont use date-fns this test will break over time
      const createDate = screen.getByText(
        formatTimeToNow('2020-08-25T16:36:19.559474+00:00')
      )
      expect(createDate).toBeInTheDocument()
    })

    it('renders a download link', () => {
      render(<Upload {...props} />, { wrapper })

      const downloadLink = screen.getByRole('link', { name: /Download/ })
      expect(downloadLink).toHaveAttribute('href', 'download.com')
    })

    it('renders carry-forward text', () => {
      render(<Upload {...props} />, { wrapper })

      const carryForward = screen.getByText('carry-forward')
      expect(carryForward).toBeInTheDocument()
    })

    it('renders checkbox that is default checked', () => {
      render(<Upload {...props} />, { wrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toBeChecked()
    })
  })

  describe('build without build link', () => {
    it('renders a the build code', () => {
      render(<Upload buildCode="1234" />, { wrapper })

      const buildCode = screen.getByText(/1234/)
      expect(buildCode).toBeInTheDocument()
    })

    it('does not link to the build if no url provided', () => {
      render(<Upload buildCode="1234" />, { wrapper })

      const buildLink = screen.queryByRole('link', { name: /1234/ })
      expect(buildLink).not.toBeInTheDocument()
    })
  })

  describe('missing data renders', () => {
    it('renders a default build code if no code was provided', () => {
      render(<Upload />, { wrapper })

      const noBuildCode = screen.getByText(/build code not found/)
      expect(noBuildCode).toBeInTheDocument()
    })

    it('does not link to the build if no url provided', () => {
      render(<Upload />, { wrapper })

      const noBuildLink = screen.queryByRole('link', /build code not found/)
      expect(noBuildLink).not.toBeInTheDocument()
    })

    it('Does not show a download link if there is no available download', () => {
      render(<Upload />, { wrapper })

      const noDownloadLink = screen.queryByRole('link', { name: /Download/ })
      expect(noDownloadLink).not.toBeInTheDocument()
    })
  })

  describe('rendering flags', () => {
    it('one flag', () => {
      render(<Upload flags={['flag1']} />, { wrapper })

      const flag1 = screen.getByText(/flag1/)
      expect(flag1).toBeInTheDocument()
    })

    it('multiple flags', () => {
      render(<Upload flags={['flag1', 'flag2', 'flag3', 'flag4']} />, {
        wrapper,
      })

      const flag1 = screen.getByText(/flag1/)
      expect(flag1).toBeInTheDocument()

      const flag2 = screen.getByText(/flag2/)
      expect(flag2).toBeInTheDocument()

      const flag3 = screen.getByText(/flag3/)
      expect(flag3).toBeInTheDocument()

      const flag4 = screen.getByText(/flag4/)
      expect(flag4).toBeInTheDocument()
    })
  })

  describe('rendering errors', () => {
    beforeEach(() => {
      // Suppress prop-type warnings.
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('fileNotFoundInStorage error', () => {
      render(<Upload errors={[{ errorCode: 'FILE_NOT_IN_STORAGE' }]} />, {
        wrapper,
      })

      const processingFailed = screen.getByText(
        /Processing failed. Please rerun the upload in a new commit../
      )
      expect(processingFailed).toBeInTheDocument()
    })

    describe('reportExpired error', () => {
      it('renders error message', () => {
        render(<Upload errors={[{ errorCode: 'REPORT_EXPIRED' }]} />, {
          wrapper,
        })

        const uploadExpired = screen.getByText(
          /Upload exceeds the max age of 12h./
        )
        expect(uploadExpired).toBeInTheDocument()
      })

      it('renders link to expired reports page', () => {
        render(<Upload errors={[{ errorCode: 'REPORT_EXPIRED' }]} />, {
          wrapper,
        })

        const expiredReports = screen.getByRole('link', {
          name: /expired reports/,
        })
        expect(expiredReports).toHaveAttribute(
          'href',
          'https://docs.codecov.com/docs/codecov-yaml#section-expired-reports'
        )
      })
    })

    describe('reportEmpty error', () => {
      it('renders error message', () => {
        render(<Upload errors={[{ errorCode: 'REPORT_EMPTY' }]} />, { wrapper })

        const uploadIsEmpty = screen.getByText(/Unusable report due to issues/)
        expect(uploadIsEmpty).toBeInTheDocument()
      })

      it('renders link to troubleshooting document', () => {
        render(<Upload errors={[{ errorCode: 'REPORT_EMPTY' }]} />, { wrapper })

        const troubleshooting = screen.getByRole('link', {
          name: /troubleshooting document/,
        })
        expect(troubleshooting).toHaveAttribute(
          'href',
          'https://docs.codecov.com/docs/error-reference#unusable-reports'
        )
      })
    })

    it('all errors', () => {
      render(
        <Upload
          errors={[
            { errorCode: 'FILE_NOT_IN_STORAGE' },
            { errorCode: 'REPORT_EXPIRED' },
            { errorCode: 'REPORT_EMPTY' },
            { errorCode: 'SOME_NEW_ERROR' },
          ]}
        />,
        { wrapper }
      )

      const processingFailed = screen.getByText(/Processing failed./)
      expect(processingFailed).toBeInTheDocument()

      const uploadExpired = screen.getByText(
        /Upload exceeds the max age of 12h./
      )
      expect(uploadExpired).toBeInTheDocument()

      const emptyUpload = screen.getByText(/Unusable report due to issues/)
      expect(emptyUpload).toBeInTheDocument()
    })

    it('handles new errors the front end does not know how to handle', () => {
      render(<Upload errors={[{ errorCode: 'SOME_NEW_ERROR' }]} />, { wrapper })

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles an unexpected error type', () => {
      render(
        <Upload
          errors={[{ errorCode: { error: 'bad config or something' } }]}
        />,
        { wrapper }
      )

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles upload state error but no error code resolved as an known error', () => {
      render(<Upload state="ERROR" />, { wrapper })

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles upload state error but no errors returned', () => {
      render(<Upload errors={[]} state="ERROR" />, { wrapper })

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('If no state is provided and no errors received do not show an error', () => {
      render(<Upload errors={[]} />, { wrapper })

      const unknownError = screen.queryByText(/Unknown error/)
      expect(unknownError).not.toBeInTheDocument()
    })

    it('removes duplicate errors', () => {
      render(
        <Upload
          errors={[
            { errorCode: 'REPORT_EMPTY' },
            { errorCode: 'REPORT_EMPTY' },
            { errorCode: { error: 'bad config or something' } },
            { errorCode: { error: 'bad config or something' } },
            { errorCode: 'SOME_NEW_ERROR' },
            { errorCode: 'SOME_NEW_ERROR' },
          ]}
        />,
        { wrapper }
      )

      const erroredUpload = screen.getByText(/Unusable report due to issues/)
      expect(erroredUpload).toBeInTheDocument()

      const unknownError = screen.getByText(/Unknown error \(4\)/)
      expect(unknownError).toBeInTheDocument()
    })
  })

  describe('rendering uploaded type of uploads', () => {
    it('does not render carry-forward text', () => {
      render(<Upload uploadType="UPLOADED" />, { wrapper })

      const carryForward = screen.queryByText('carry-forward')
      expect(carryForward).not.toBeInTheDocument()
    })
  })

  describe('Upload reference when upload name exists', () => {
    it('renders upload name instead of buildCode', () => {
      render(<Upload name="upload name" ciUrl="ciUrl.com" />, { wrapper })

      const name = screen.getByText('upload name')
      expect(name).toBeInTheDocument()
    })
  })

  describe('interacting with the checkbox', () => {
    function setup() {
      const props = {
        ciUrl: 'ciUrl.com',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        downloadUrl: 'download.com',
        buildCode: '1234',
        uploadType: 'CARRIEDFORWARD',
        id: 0,
      }

      const user = userEvent.setup()

      return { props, user }
    }

    it('adds id to query cache when clicked', async () => {
      const { props, user } = setup()

      render(<Upload {...props} />, { wrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      await waitFor(() =>
        expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual([
          0,
        ])
      )
    })

    it('removes if from query cache when user re-checks checkbox', async () => {
      const { props, user } = setup()

      render(<Upload {...props} />, { wrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual([0])

      await user.click(checkbox)

      expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual([])
    })
  })
})

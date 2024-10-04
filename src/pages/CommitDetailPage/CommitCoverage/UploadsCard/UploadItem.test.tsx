import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'
import { Upload } from 'shared/utils/extractUploads'

import UploadItem from './UploadItem'

const mockUpload: Upload = {
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
}

const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
    it('renders the build code', () => {
      render(<UploadItem upload={{ ...mockUpload, buildCode: '1234' }} />, {
        wrapper,
      })

      const buildCode = screen.getByText(/1234/)
      expect(buildCode).toBeInTheDocument()
    })

    it('link to the build', () => {
      render(
        <UploadItem
          upload={{ ...mockUpload, buildCode: '1234', ciUrl: 'ciUrl.com' }}
        />,
        { wrapper }
      )

      const buildLink = screen.getByRole('link', { name: /1234/ })
      expect(buildLink).toHaveAttribute('href', 'ciUrl.com')
    })

    it('created at dates', () => {
      render(<UploadItem upload={mockUpload} />, { wrapper })

      // If we dont use date-fns this test will break over time
      const createDate = screen.getByText(
        formatTimeToNow('2020-08-25T16:36:19.559474+00:00')!
      )
      expect(createDate).toBeInTheDocument()
    })

    it('renders a download link', () => {
      render(
        <UploadItem upload={{ ...mockUpload, downloadUrl: 'download.com' }} />,
        { wrapper }
      )

      const downloadLink = screen.getByRole('link', { name: /Download/ })
      expect(downloadLink).toHaveAttribute('href', 'download.com')
    })

    it('renders carry-forward text', () => {
      render(
        <UploadItem upload={{ ...mockUpload, uploadType: 'CARRIEDFORWARD' }} />,
        { wrapper }
      )

      const carryForward = screen.getByText('carry-forward')
      expect(carryForward).toBeInTheDocument()
    })

    it('renders checkbox that is default checked', () => {
      render(<UploadItem upload={mockUpload} />, { wrapper })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toBeChecked()
    })
  })

  describe('build without build link', () => {
    it('renders a the build code', () => {
      render(<UploadItem upload={{ ...mockUpload, buildCode: '1234' }} />, {
        wrapper,
      })

      const buildCode = screen.getByText(/1234/)
      expect(buildCode).toBeInTheDocument()
    })

    it('does not link to the build if no url provided', () => {
      render(
        <UploadItem
          upload={{ ...mockUpload, buildCode: '1234', ciUrl: undefined }}
        />,
        {
          wrapper,
        }
      )

      const buildLink = screen.queryByRole('link', { name: /1234/ })
      expect(buildLink).not.toBeInTheDocument()
    })
  })

  describe('missing data renders', () => {
    it('does not link to the build if no url provided', () => {
      render(<UploadItem upload={{ ...mockUpload, ciUrl: undefined }} />, {
        wrapper,
      })

      const noBuildLink = screen.queryByRole('link', {
        name: /build code not found/,
      })
      expect(noBuildLink).not.toBeInTheDocument()
    })

    it('Does not show a download link if there is no available download', () => {
      render(
        <UploadItem upload={{ ...mockUpload, downloadUrl: undefined }} />,
        { wrapper }
      )

      const noDownloadLink = screen.queryByRole('link', { name: /Download/ })
      expect(noDownloadLink).not.toBeInTheDocument()
    })
  })

  describe('rendering flags', () => {
    it('undefined flags', () => {
      // just making sure it renders without breaking
      render(<UploadItem upload={{ ...mockUpload, flags: undefined }} />, {
        wrapper,
      })

      const flag1 = screen.queryByText(/flag1/)
      expect(flag1).not.toBeInTheDocument()
    })

    it('one flag', () => {
      render(<UploadItem upload={{ ...mockUpload, flags: ['flag1'] }} />, {
        wrapper,
      })

      const flag1 = screen.getByText(/flag1/)
      expect(flag1).toBeInTheDocument()
    })

    it('multiple flags', () => {
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            flags: ['flag1', 'flag2', 'flag3', 'flag4'],
          }}
        />,
        {
          wrapper,
        }
      )

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
    it('handles null error', () => {
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [null],
          }}
        />,
        {
          wrapper,
        }
      )

      const upload = screen.getByText('721065746')
      expect(upload).toBeInTheDocument()
    })

    it('handles null/undefined errorCode', () => {
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [{ errorCode: null }],
          }}
        />,
        {
          wrapper,
        }
      )

      const upload = screen.getByText('721065746')
      expect(upload).toBeInTheDocument()
    })

    it('fileNotFoundInStorage error', () => {
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [{ errorCode: 'FILE_NOT_IN_STORAGE' }],
          }}
        />,
        {
          wrapper,
        }
      )

      const processingFailed = screen.getByText(
        /Processing failed. Please rerun the upload in a new commit./
      )
      expect(processingFailed).toBeInTheDocument()
    })

    describe('reportExpired error', () => {
      it('renders error message', () => {
        render(
          <UploadItem
            upload={{
              ...mockUpload,
              errors: [{ errorCode: 'REPORT_EXPIRED' }],
            }}
          />,
          {
            wrapper,
          }
        )

        const uploadExpired = screen.getByText(
          /Upload exceeds the max age of 12h./
        )
        expect(uploadExpired).toBeInTheDocument()
      })

      it('renders link to expired reports page', () => {
        render(
          <UploadItem
            upload={{
              ...mockUpload,
              errors: [{ errorCode: 'REPORT_EXPIRED' }],
            }}
          />,
          {
            wrapper,
          }
        )

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
        render(
          <UploadItem
            upload={{
              ...mockUpload,
              errors: [{ errorCode: 'REPORT_EMPTY' }],
            }}
          />,
          {
            wrapper,
          }
        )

        const uploadIsEmpty = screen.getByText(/Unusable report due to issues/)
        expect(uploadIsEmpty).toBeInTheDocument()
      })

      it('renders link to troubleshooting document', () => {
        render(
          <UploadItem
            upload={{ ...mockUpload, errors: [{ errorCode: 'REPORT_EMPTY' }] }}
          />,
          {
            wrapper,
          }
        )

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
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [
              { errorCode: 'FILE_NOT_IN_STORAGE' },
              { errorCode: 'REPORT_EXPIRED' },
              { errorCode: 'REPORT_EMPTY' },
              { errorCode: 'UNKNOWN_PROCESSING' },
              { errorCode: 'UNKNOWN_STORAGE' },
            ],
          }}
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
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [{ errorCode: 'UNKNOWN_PROCESSING' }],
          }}
        />,
        {
          wrapper,
        }
      )

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles an unexpected error type', () => {
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [{ errorCode: 'UNKNOWN_STORAGE' }],
          }}
        />,
        { wrapper }
      )

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles upload state error but no error code resolved as an known error', () => {
      render(<UploadItem upload={{ ...mockUpload, state: 'ERROR' }} />, {
        wrapper,
      })

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles upload state error but no errors returned', () => {
      render(
        <UploadItem upload={{ ...mockUpload, errors: [], state: 'ERROR' }} />,
        { wrapper }
      )

      const unknownError = screen.getByText(/Unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('If no state is provided and no errors received do not show an error', () => {
      render(
        <UploadItem upload={{ ...mockUpload, state: undefined, errors: [] }} />,
        { wrapper }
      )

      const unknownError = screen.queryByText(/Unknown error/)
      expect(unknownError).not.toBeInTheDocument()
    })

    it('removes duplicate errors', () => {
      render(
        <UploadItem
          upload={{
            ...mockUpload,
            errors: [
              { errorCode: 'REPORT_EMPTY' },
              { errorCode: 'REPORT_EMPTY' },
            ],
          }}
        />,
        { wrapper }
      )

      const erroredUpload = screen.getByText(/Unusable report due to issues/)
      expect(erroredUpload).toBeInTheDocument()
    })
  })

  describe('rendering uploaded type of uploads', () => {
    it('does not render carry-forward text', () => {
      render(
        <UploadItem upload={{ ...mockUpload, uploadType: 'UPLOADED' }} />,
        { wrapper }
      )

      const carryForward = screen.queryByText('carry-forward')
      expect(carryForward).not.toBeInTheDocument()
    })
  })

  describe('Upload reference when upload name exists', () => {
    it('renders upload name instead of buildCode', () => {
      render(
        <UploadItem
          upload={{ ...mockUpload, name: 'upload name', ciUrl: 'ciUrl.com' }}
        />,
        { wrapper }
      )

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
        uploadType: 'CARRIEDFORWARD' as const,
        id: 0,
      }

      const user = userEvent.setup()

      return { props, user }
    }

    it('adds id to query cache when clicked', async () => {
      const { props, user } = setup()

      render(<UploadItem upload={{ ...mockUpload, ...props }} />, { wrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      await waitFor(() =>
        expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual([
          0,
        ])
      )
    })

    it('removes from query cache when user re-checks checkbox', async () => {
      const { props, user } = setup()

      render(<UploadItem upload={{ ...mockUpload, ...props }} />, { wrapper })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual([0])

      await user.click(checkbox)

      expect(queryClient.getQueryData(['IgnoredUploadIds'])).toStrictEqual([])
    })

    it('handles undefined id gracefully', async () => {
      const { props, user } = setup()

      render(
        <UploadItem upload={{ ...mockUpload, ...props, id: undefined }} />,
        { wrapper }
      )

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(checkbox).toHaveAttribute('data-state', 'unchecked')

      await user.click(checkbox)

      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })
  })
})

import { render, screen } from '@testing-library/react'

import { formatTimeToNow } from 'shared/utils/dates'

import Upload from './Upload'

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
      render(<Upload {...props} />)

      const buildCode = screen.getByText(/1234/)
      expect(buildCode).toBeInTheDocument()
    })

    it('link to the build', () => {
      render(<Upload {...props} />)

      const buildLink = screen.getByRole('link', { name: /1234/ })
      expect(buildLink).toHaveAttribute('href', 'ciUrl.com')
    })

    it('created at dates', () => {
      render(<Upload {...props} />)

      // If we dont use date-fns this test will break over time
      const createDate = screen.getByText(
        formatTimeToNow('2020-08-25T16:36:19.559474+00:00')
      )
      expect(createDate).toBeInTheDocument()
    })

    it('renders a download link', () => {
      render(<Upload {...props} />)

      const downloadLink = screen.getByRole('link', { name: /Download/ })
      expect(downloadLink).toHaveAttribute('href', 'download.com')
    })

    it('renders carry-forward text', () => {
      render(<Upload {...props} />)

      const carryForward = screen.getByText('carry-forward')
      expect(carryForward).toBeInTheDocument()
    })
  })

  describe('build without build link', () => {
    it('renders a the build code', () => {
      render(<Upload buildCode="1234" />)

      const buildCode = screen.getByText(/1234/)
      expect(buildCode).toBeInTheDocument()
    })

    it('does not link to the build if no url provided', () => {
      render(<Upload buildCode="1234" />)

      const buildLink = screen.queryByRole('link', { name: /1234/ })
      expect(buildLink).not.toBeInTheDocument()
    })
  })

  describe('missing data renders', () => {
    it('renders a default build code if no code was provided', () => {
      render(<Upload />)

      const noBuildCode = screen.getByText(/build code not found/)
      expect(noBuildCode).toBeInTheDocument()
    })

    it('does not link to the build if no url provided', () => {
      render(<Upload />)

      const noBuildLink = screen.queryByRole('link', /build code not found/)
      expect(noBuildLink).not.toBeInTheDocument()
    })

    it('Does not show a download link if there is no available download', () => {
      render(<Upload />)

      const noDownloadLink = screen.queryByRole('link', { name: /Download/ })
      expect(noDownloadLink).not.toBeInTheDocument()
    })
  })

  describe('rendering flags', () => {
    it('one flag', () => {
      render(<Upload flags={['flag1']} />)

      const flag1 = screen.getByText(/flag1/)
      expect(flag1).toBeInTheDocument()
    })

    it('multiple flags', () => {
      render(<Upload flags={['flag1', 'flag2', 'flag3', 'flag4']} />)

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
      // Supress proptype warnings.
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('fileNotFoundInStorage error', () => {
      render(<Upload errors={[{ errorCode: 'FILE_NOT_IN_STORAGE' }]} />)

      const processingFailed = screen.getByText(/processing failed/)
      expect(processingFailed).toBeInTheDocument()
    })

    it('reportExpired error', () => {
      render(<Upload errors={[{ errorCode: 'REPORT_EXPIRED' }]} />)

      const uploadExpired = screen.getByText(/upload expired/)
      expect(uploadExpired).toBeInTheDocument()
    })

    it('reportEmpty error', () => {
      render(<Upload errors={[{ errorCode: 'REPORT_EMPTY' }]} />)

      const uploadIsEmpty = screen.getByText(/unusable report/)
      expect(uploadIsEmpty).toBeInTheDocument()
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
        />
      )

      const processingFailed = screen.getByText(/processing failed/)
      expect(processingFailed).toBeInTheDocument()

      const uploadExpired = screen.getByText(/upload expired/)
      expect(uploadExpired).toBeInTheDocument()

      const emptyUpload = screen.getByText(/unusable report/)
      expect(emptyUpload).toBeInTheDocument()
    })

    it('handles new errors the front end does not know how to handle', () => {
      render(<Upload errors={[{ errorCode: 'SOME_NEW_ERROR' }]} />)

      const unknownError = screen.getByText(/unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles an unexpected error type', () => {
      render(
        <Upload
          errors={[{ errorCode: { error: 'bad config or something' } }]}
        />
      )

      const unknownError = screen.getByText(/unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles upload state error but no error code resolved as an known error', () => {
      render(<Upload state="ERROR" />)

      const unknownError = screen.getByText(/unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('handles upload state error but no errors returned', () => {
      render(<Upload errors={[]} state="ERROR" />)

      const unknownError = screen.getByText(/unknown error/)
      expect(unknownError).toBeInTheDocument()
    })

    it('If no state is provided and no errors received do not show an error', () => {
      render(<Upload errors={[]} />)

      const unknownError = screen.queryByText(/unknown error/)
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
        />
      )

      const erroredUpload = screen.getByText(/unusable report \(2\)/)
      expect(erroredUpload).toBeInTheDocument()

      const unknownError = screen.getByText(/unknown error \(4\)/)
      expect(unknownError).toBeInTheDocument()
    })
  })

  describe('rendering uploaded type of uploads', () => {
    it('does not render carry-forward text', () => {
      render(<Upload uploadType="UPLOADED" />)

      const carryForward = screen.queryByText('carry-forward')
      expect(carryForward).not.toBeInTheDocument()
    })
  })

  describe('Upload reference when upload name exists', () => {
    it('renders upload name instead of buildCode', () => {
      render(<Upload name="upload name" ciUrl="ciUrl.com" />)

      const name = screen.getByText('upload name')
      expect(name).toBeInTheDocument()
    })
  })
})

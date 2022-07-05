import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUploadPresignedUrl } from 'services/uploadPresignedUrl'
import { formatTimeToNow } from 'shared/utils/dates'

import Upload from './Upload'

jest.mock('services/uploadPresignedUrl')

const queryClient = new QueryClient()
const mockedPresignedUrl = {
  presignedUrl:
    'http://minio:9000/archive/v4/raw/2022-06-23/942173DE95CBF167C5683F40B7DB34C0/ee3ecad424e67419d6c4531540f1ef5df045ff12/919ccc6d-7972-4895-b289-f2d569683a17.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=codecov-default-key%2F20220705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220705T101702Z&X-Amz-Expires=10&X-Amz-SignedHeaders=host&X-Amz-Signature=8846492d85f62187493cbff3631ec7f0ccf2d355f768eecf294f0572cf758e4c',
}

describe('UploadsCard', () => {
  function setup({ props, data = mockedPresignedUrl }) {
    useUploadPresignedUrl.mockReturnValue({ data })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/test']}>
        <Route path="/:provider/:owner/:repo">
          <QueryClientProvider client={queryClient}>
            <Upload {...props} />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup({
        props: {
          ciUrl: 'ciUrl.com',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          downloadUrl: 'download.com',
          buildCode: '1234',
          uploadType: 'CARRIEDFORWARD',
        },
      })
    })

    it('renders the build code', () => {
      expect(screen.getByText(/1234/)).toBeInTheDocument()
    })
    it('link to the build', () => {
      expect(screen.getByRole('link', { name: /1234/ })).toHaveAttribute(
        'href',
        'ciUrl.com'
      )
    })
    it('created at dates', () => {
      // If we dont use date-fns this test will break over time
      const createDate = formatTimeToNow('2020-08-25T16:36:19.559474+00:00')
      expect(screen.getByText(createDate)).toBeInTheDocument()
    })
    it('renders a download link', () => {
      expect(
        screen.getByRole('link', { name: /1234 external-link.svg/ })
      ).toHaveAttribute('href')
    })

    it('renders carry-forward text', () => {
      expect(screen.getByText('carry-forward')).toBeInTheDocument()
    })
  })

  describe('build without build link', () => {
    beforeEach(() => {
      setup({ props: { buildCode: '1234' } })
    })
    it('renders a the build code', () => {
      expect(screen.getByText(/1234/)).toBeInTheDocument()
    })
    it('does not link to the build if no url provided', () => {
      expect(
        screen.queryByRole('link', { name: /1234/ })
      ).not.toBeInTheDocument()
    })
  })
  describe('missinng data renders', () => {
    beforeEach(() => {
      setup({ props: {}, data: null })
    })

    it('renders a default build code if no code was provided', () => {
      expect(screen.getByText(/build code not found/)).toBeInTheDocument()
    })
    it('does not link to the build if no url provided', () => {
      expect(
        screen.queryByRole('link', /build code not found/)
      ).not.toBeInTheDocument()
    })
    it('Does not show a download link if there is no availble download', () => {
      expect(
        screen.queryByRole('link', { name: /Download/ })
      ).not.toBeInTheDocument()
    })
  })
  describe('rendering flags', () => {
    it('one flag', () => {
      setup({
        props: {
          flags: ['flag1'],
        },
      })
      expect(screen.getByText(/flag1/)).toBeInTheDocument()
    })
    it('multiple flags', () => {
      setup({
        props: {
          flags: ['flag1', 'flag2', 'flag3', 'flag4'],
        },
      })
      expect(screen.getByText(/flag1/)).toBeInTheDocument()
      expect(screen.getByText(/flag2/)).toBeInTheDocument()
      expect(screen.getByText(/flag3/)).toBeInTheDocument()
      expect(screen.getByText(/flag4/)).toBeInTheDocument()
    })
  })
  describe('rendering errors', () => {
    beforeEach(() => {
      // Supress proptype warnings.
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('fileNotFoundInStorage error', () => {
      setup({
        props: {
          errors: [{ errorCode: 'FILE_NOT_IN_STORAGE' }],
        },
      })
      expect(screen.getByText(/processing failed/)).toBeInTheDocument()
    })
    it('reportExpired error', () => {
      setup({
        props: {
          errors: [{ errorCode: 'REPORT_EXPIRED' }],
        },
      })
      expect(screen.getByText(/upload expired/)).toBeInTheDocument()
    })
    it('reportEmpty error', () => {
      setup({
        props: {
          errors: [{ errorCode: 'REPORT_EMPTY' }],
        },
      })
      expect(screen.getByText(/upload is empty/)).toBeInTheDocument()
    })
    it('all errors', () => {
      setup({
        props: {
          errors: [
            { errorCode: 'FILE_NOT_IN_STORAGE' },
            { errorCode: 'REPORT_EXPIRED' },
            { errorCode: 'REPORT_EMPTY' },
            { errorCode: 'SOME_NEW_ERROR' },
          ],
        },
      })
      expect(screen.getByText(/processing failed/)).toBeInTheDocument()
      expect(screen.getByText(/upload expired/)).toBeInTheDocument()
      expect(screen.getByText(/upload is empty/)).toBeInTheDocument()
    })
    it('handles new errors the front end doesnt know how to handle', () => {
      setup({
        props: {
          errors: [{ errorCode: 'SOME_NEW_ERROR' }],
        },
      })
      expect(screen.getByText(/unknown error/)).toBeInTheDocument()
    })
    it('handles an unexpected error type', () => {
      setup({
        props: {
          errors: [{ errorCode: { error: 'bad config or something' } }],
        },
      })
      expect(screen.getByText(/unknown error/)).toBeInTheDocument()
    })
    it('handles upload state error but no error code resolved as an known error', () => {
      setup({
        props: {
          state: 'ERROR',
        },
      })
      expect(screen.getByText(/unknown error/)).toBeInTheDocument()
    })
    it('handles upload state error but no errors returned', () => {
      setup({
        props: {
          state: 'ERROR',
          errors: [],
        },
      })
      expect(screen.getByText(/unknown error/)).toBeInTheDocument()
    })
    it('If no state is provided and no errors received do not show an error', () => {
      setup({
        props: {
          error: [],
        },
      })
      expect(screen.queryByText(/unknown error/)).not.toBeInTheDocument()
    })
  })

  describe('rendering uploaded type of uploads', () => {
    setup({ props: { uploadType: 'UPLOADED' } })
    it('does not render carry-forward text', () => {
      expect(screen.queryByText('carry-forward')).not.toBeInTheDocument()
    })
  })
})

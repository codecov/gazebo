import { render, screen } from '@testing-library/react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import Upload from './Upload'

describe('UploadsCard', () => {
  function setup(props) {
    render(<Upload {...props} />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup({
        ciUrl: 'ciUrl.com',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        downloadUrl: 'download.com',
        buildCode: '1234',
        uploadType: 'CARRIEDFORWARD',
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
      const createDate = formatDistanceToNow(
        new Date('2020-08-25T16:36:19.559474+00:00'),
        {
          addSuffix: true,
        }
      )
      expect(screen.getByText(createDate)).toBeInTheDocument()
    })
    it('renders a download link', () => {
      expect(screen.getByRole('link', { name: /Download/ })).toHaveAttribute(
        'href',
        'download.com'
      )
    })

    it('renders carry-forward text', () => {
      expect(screen.getByText('carry-forward')).toBeInTheDocument()
    })
  })

  describe('build without build link', () => {
    beforeEach(() => {
      setup({ buildCode: '1234' })
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
      setup({})
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
        flags: ['flag1'],
      })
      expect(screen.getByText(/flag1/)).toBeInTheDocument()
    })
    it('multiple flags', () => {
      setup({
        flags: ['flag1', 'flag2', 'flag3', 'flag4'],
      })
      expect(screen.getByText(/flag1/)).toBeInTheDocument()
      expect(screen.getByText(/flag2/)).toBeInTheDocument()
      expect(screen.getByText(/flag3/)).toBeInTheDocument()
      expect(screen.getByText(/flag4/)).toBeInTheDocument()
    })
  })
  describe('rendering errors', () => {
    it('fileNotFoundInStorage error', () => {
      setup({
        errors: [{ errorCode: 'FILE_NOT_IN_STORAGE' }],
      })
      expect(screen.getByText(/processing failed/)).toBeInTheDocument()
    })
    it('reportExpired error', () => {
      setup({
        errors: [{ errorCode: 'REPORT_EXPIRED' }],
      })
      expect(screen.getByText(/upload expired/)).toBeInTheDocument()
    })
    it('reportEmpty error', () => {
      setup({
        errors: [{ errorCode: 'REPORT_EMPTY' }],
      })
      expect(screen.getByText(/upload is empty/)).toBeInTheDocument()
    })
    it('all errors', () => {
      setup({
        errors: [
          { errorCode: 'FILE_NOT_IN_STORAGE' },
          { errorCode: 'REPORT_EXPIRED' },
          { errorCode: 'REPORT_EMPTY' },
        ],
      })
      expect(screen.getByText(/processing failed/)).toBeInTheDocument()
      expect(screen.getByText(/upload expired/)).toBeInTheDocument()
      expect(screen.getByText(/upload is empty/)).toBeInTheDocument()
    })
  })

  describe('rendering uploaded type of uploads', () => {
    setup({ uploadType: 'UPLOADED' })
    it('does not render carry-forward text', () => {
      expect(screen.queryByText('carry-forward')).not.toBeInTheDocument()
    })
  })
})

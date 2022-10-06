import { render, screen } from 'custom-testing-library'

import ErroredUploads from './ErroredUploads'

const mockErroredUploads = {
  'github actions': [
    {
      buildCode: '82364',
      ciUrl: 'https://example.com',
      createdAt: '2020-08-25T16:36:19.559474+00:00',
      downloadUrl: '/test.txt',
      jobCode: '1234',
      provider: 'github actions',
      state: 'ERROR',
      updatedAt: '2020-08-25T16:36:19.679868+00:00',
      uploadType: 'UPLOADED',
    },
  ],
  circleCI: [
    {
      buildCode: '20374',
      ciUrl: 'https://example2.com',
      createdAt: '2020-08-25T16:36:19.559474+00:00',
      downloadUrl: 'another-url',
      jobCode: '1234',
      provider: 'github actions',
      state: 'ERROR',
      updatedAt: '2020-08-25T16:36:19.679868+00:00',
      uploadType: 'UPLOADED',
    },
  ],
}

describe('ErroredUploads', () => {
  function setup({ erroredUploads = mockErroredUploads }) {
    render(<ErroredUploads erroredUploads={erroredUploads} />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup({})
    })

    it('failed uploads text', () => {
      expect(
        screen.getByText(/The following uploads failed to process:/)
      ).toBeInTheDocument()
    })

    it('all providers involved', () => {
      expect(screen.getByText(/circleCI/)).toBeInTheDocument()
      expect(screen.getByText(/github actions/)).toBeInTheDocument()
    })

    it('build code', () => {
      expect(screen.getByText(82364)).toBeInTheDocument()
      expect(screen.getByText(20374)).toBeInTheDocument()
    })

    it('recommendation text', () => {
      expect(
        screen.getByText(
          /We recommend checking the Codecov step of this commit’s CI Run to make sure it uploaded properly and, if needed, run your CI again./
        )
      ).toBeInTheDocument()
    })
  })

  describe('when empty', () => {
    beforeEach(() => {
      setup({ erroredUploads: {} })
    })

    it('renders nothing', () => {
      expect(
        screen.queryByText(/The following uploads failed to process:/)
      ).not.toBeInTheDocument()
    })
  })
})

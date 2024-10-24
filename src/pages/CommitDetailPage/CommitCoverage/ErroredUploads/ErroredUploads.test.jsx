import { render, screen } from '@testing-library/react'

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
  describe('renders', () => {
    it('failed uploads text', () => {
      render(<ErroredUploads erroredUploads={mockErroredUploads} />)

      const message = screen.getByText(
        /No coverage data is available due to incomplete uploads on the first attempt./
      )
      expect(message).toBeInTheDocument()
    })

    it('recommendation text', () => {
      render(<ErroredUploads erroredUploads={mockErroredUploads} />)

      const recommendationText = screen.getByText(
        /To receive coverage data, ensure your coverage data is accurate and then open a new commit./
      )
      expect(recommendationText).toBeInTheDocument()
    })
  })

  describe('when empty', () => {
    it('renders nothing', () => {
      render(<ErroredUploads erroredUploads={{}} />)

      const message = screen.queryByText(
        /No coverage data is available due to incomplete uploads on the first attempt./
      )
      expect(message).not.toBeInTheDocument()
    })
  })
})

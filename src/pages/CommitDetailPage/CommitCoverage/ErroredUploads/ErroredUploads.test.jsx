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
        /The following uploads failed to process:/
      )
      expect(message).toBeInTheDocument()
    })

    it('all providers involved', () => {
      render(<ErroredUploads erroredUploads={mockErroredUploads} />)

      const circle = screen.getByText(/circleCI/)
      expect(circle).toBeInTheDocument()

      const ghActions = screen.getByText(/github actions/)
      expect(ghActions).toBeInTheDocument()
    })

    it('build code', () => {
      render(<ErroredUploads erroredUploads={mockErroredUploads} />)

      const buildCode1 = screen.getByText(82364)
      expect(buildCode1).toBeInTheDocument()

      const buildCode2 = screen.getByText(20374)
      expect(buildCode2).toBeInTheDocument()
    })

    it('recommendation text', () => {
      render(<ErroredUploads erroredUploads={mockErroredUploads} />)

      const recommendationText = screen.getByText(/We recommend checking/)
      expect(recommendationText).toBeInTheDocument()
    })
  })

  describe('when empty', () => {
    it('renders nothing', () => {
      render(<ErroredUploads erroredUploads={{}} />)

      const message = screen.queryByText(
        /The following uploads failed to process:/
      )
      expect(message).not.toBeInTheDocument()
    })
  })
})

import { render, screen } from '@testing-library/react'

import InfoBanner from './InfoBanner'

describe('InfoBanner', () => {
  describe('both branch and bundle are defined', () => {
    it('renders nothing', () => {
      const { container } = render(
        <InfoBanner branch="branch" bundle="bundle" />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('only branch is defined', () => {
    it('renders NoSelectedBundleContent', () => {
      render(<InfoBanner branch="branch" />)

      const header = screen.getByText('No Bundle Selected')
      expect(header).toBeInTheDocument()

      const body = screen.getByText(
        'Please select a bundle to view the detailed bundle breakdown.'
      )
      expect(body).toBeInTheDocument()
    })
  })

  describe('branch and bundle are not defined', () => {
    it('renders NoSelectedBranchContent', () => {
      render(<InfoBanner branch={null} />)

      const header = screen.getByText('No Branch Selected')
      expect(header).toBeInTheDocument()

      const body = screen.getByText(
        'Please select a branch to view the list of bundles.'
      )
      expect(body).toBeInTheDocument()
    })
  })
})

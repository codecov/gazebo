import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import CodeRendererProgressHeader from './CodeRendererProgressHeader'

jest.mock('shared/featureFlags')

describe('CodeRendererProgressHeader', () => {
  function setup(props, flagValue = false) {
    useFlags.mockReturnValue({
      unifyFileViewers: flagValue,
    })
    render(<CodeRendererProgressHeader {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered with without treepaths', () => {
    beforeEach(() => {
      setup({
        path: undefined,
        pathRef: undefined,
        fileCoverage: 39.28,
        change: 34.21,
      })
    })

    it('renders progress percent and change percent', () => {
      const change = screen.getByText(/34.21%/)
      expect(change).toBeInTheDocument()
      const headCoverage = screen.getByText(/39.28%/)
      expect(headCoverage).toBeInTheDocument()
    })
  })

  describe('when rendered with treepaths', () => {
    beforeEach(() => {
      setup({
        path: 'path/to/file.js',
        pathRef: 'main',
        fileCoverage: 39.28,
        change: 34.21,
      })
    })

    it('renders progress, change and filepath', () => {
      const change = screen.getByText(/34.21%/)
      expect(change).toBeInTheDocument()
      const headCoverage = screen.getByText(/39.28%/)
      expect(headCoverage).toBeInTheDocument()
      const filename = screen.getByText(/file.js/)
      expect(filename).toBeInTheDocument()
      expect(screen.getByText(/path/)).toBeInTheDocument()
      expect(screen.getByText(/to/)).toBeInTheDocument()
    })
  })

  describe('when feature flag is true', () => {
    beforeEach(() => {
      setup(
        {
          path: 'path/to/file.js',
          pathRef: 'main',
          fileCoverage: 39.28,
          change: 34.21,
        },
        true
      )
    })

    it('renders anchor tag', () => {
      const link = screen.getByRole('link', { name: 'path/to/file.js' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('id', '#path/to/file.js')
      expect(link).toHaveAttribute('href', '#path/to/file.js')
    })
  })
})

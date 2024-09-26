import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import CodeRendererProgressHeader from './CodeRendererProgressHeader'

describe('CodeRendererProgressHeader', () => {
  describe('when rendered with without tree paths', () => {
    it('renders progress percent and change percent', () => {
      render(
        <CodeRendererProgressHeader fileCoverage={39.28} change={34.21} />,
        { wrapper: MemoryRouter }
      )

      const change = screen.getByText(/34.21%/)
      expect(change).toBeInTheDocument()

      const headCoverage = screen.getByText(/39.28%/)
      expect(headCoverage).toBeInTheDocument()
    })
  })

  describe('when rendered with tree paths', () => {
    it('renders progress, change and filepath', () => {
      render(
        <CodeRendererProgressHeader
          path="path/to/file.js"
          pathRef="main"
          fileCoverage={39.28}
          change={34.21}
        />,
        { wrapper: MemoryRouter }
      )

      const change = screen.getByText(/34.21%/)
      expect(change).toBeInTheDocument()

      const headCoverage = screen.getByText(/39.28%/)
      expect(headCoverage).toBeInTheDocument()

      const filename = screen.getByText(/file.js/)
      expect(filename).toBeInTheDocument()

      const path = screen.getByText(/path/)
      expect(path).toBeInTheDocument()

      const to = screen.getByText(/to/)
      expect(to).toBeInTheDocument()
    })
  })
})

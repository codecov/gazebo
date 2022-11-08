import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CIStatus from './CIStatus'

describe('CIStatus', () => {
  function setup(props) {
    render(
      <MemoryRouter initialEntries={['/gh/test/gazebo/commits']}>
        <Route path="/:provider/:owner/:repo/commits">
          <CIStatus {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with passed ci and valid coverage', () => {
    beforeEach(() => {
      setup({
        coverage: 90,
        ciPassed: true,
        commitid: '123456789',
      })
    })

    it('renders shortcut for commit id', () => {
      const id = screen.getByText(/12345678/)
      expect(id).toBeInTheDocument()
    })

    it('renders passed ci status', () => {
      const status = screen.getByText(/Passed/)
      expect(status).toBeInTheDocument()
    })

    it('renders passed status icon', () => {
      const icon = screen.getByText(/check.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when rendered with failed ci and valid coverage', () => {
    beforeEach(() => {
      setup({
        coverage: 90,
        ciPassed: false,
        commitid: '123456789',
      })
    })

    it('renders shortcut for commit id', () => {
      const id = screen.getByText(/12345678/)
      expect(id).toBeInTheDocument()
    })

    it('renders failed ci status', () => {
      const status = screen.getByText(/Failed/)
      expect(status).toBeInTheDocument()
    })

    it('renders failed status icon', () => {
      const icon = screen.getByText(/x.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when rendered with no valid coverage', () => {
    beforeEach(() => {
      setup({
        coverage: 0,
        ciPassed: null,
        commitid: '123456789',
      })
    })

    it('renders shortcut for commit id', () => {
      const id = screen.getByText(/12345678/)
      expect(id).toBeInTheDocument()
    })

    it('renders does not render failed status icon', () => {
      const icon = screen.queryByText(/x.svg/)
      expect(icon).not.toBeInTheDocument()
    })
  })
})

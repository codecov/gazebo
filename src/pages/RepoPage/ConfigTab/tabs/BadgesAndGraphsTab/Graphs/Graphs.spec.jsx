import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Graphs from './Graphs'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config/badge']}>
    <Route path="/:provider/:owner/:repo/config/badge">{children}</Route>
  </MemoryRouter>
)

describe('Graphs', () => {
  describe('renders Graphs component', () => {
    it('renders title', () => {
      render(<Graphs graphToken="WIO9JXFGE" />, { wrapper })

      const title = screen.getByText(/Graphs/)
      expect(title).toBeInTheDocument()
    })

    it('renders Embed via API component', () => {
      render(<Graphs graphToken="WIO9JXFGE" />, { wrapper })

      const p = screen.getByText(
        /Use this token to view graphs and images for third party dashboard usage./
      )
      expect(p).toBeInTheDocument()

      const token = screen.getAllByText(/WIO9JXFGE/)[0]
      expect(token).toBeInTheDocument()
    })

    it('renders Embed via URL component', () => {
      render(<Graphs graphToken="WIO9JXFGE" />, { wrapper })

      const p = screen.getByText(
        /Use the URL of the svg to embed a graph of your repository page./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders three different graphs cards', () => {
      render(<Graphs graphToken="WIO9JXFGE" />, { wrapper })

      expect(screen.getByText(/Sunburst/)).toBeInTheDocument()
      expect(
        screen.getByText(/The inner-most circle is the entire/)
      ).toBeInTheDocument()

      expect(screen.getByText(/Grid/)).toBeInTheDocument()
      expect(
        screen.getByText(/Each block represents a single/)
      ).toBeInTheDocument()

      expect(screen.getByText(/Icicle/)).toBeInTheDocument()
      expect(
        screen.getByText(/The top section represents the entire/)
      ).toBeInTheDocument()
    })

    it('renders open SVG', () => {
      render(<Graphs graphToken="WIO9JXFGE" />, { wrapper })

      const url = screen.getAllByRole('link', { name: /Open SVG/ })
      expect(url).toHaveLength(3)

      expect(url[0]).toHaveAttribute(
        'href',
        'https://stage-web.codecov.dev/gh/codecov/codecov-client/graphs/sunburst.svg?token=WIO9JXFGE'
      )
    })
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ContentsTableHeader from './ContentsTableHeader'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/owner/coolrepo/tree/main/src/tests']}>
    <Route path="/:provider/:owner/:repo/tree/:branch/:path+">{children}</Route>
  </MemoryRouter>
)

describe('ContentsTableHeader', () => {
  describe('path is provided in route', () => {
    it('renders the child', () => {
      render(
        <ContentsTableHeader>
          <p>Hello World</p>
        </ContentsTableHeader>,
        { wrapper }
      )

      const wrappingDiv = screen.getByText('Hello World')
      expect(wrappingDiv).toBeInTheDocument()
    })
  })
})

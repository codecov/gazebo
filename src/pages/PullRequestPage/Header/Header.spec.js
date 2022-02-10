import { render, screen } from 'custom-testing-library'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePull } from 'services/pull'
import Header from './Header'

const pull = {
  pullId: 5,
  title: 'fix stuff',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
}

jest.mock('services/pull/hooks')

describe('Header', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    usePull.mockReturnValue({ data: pull })

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullid">
          <Header />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the pr overview', () => {
      expect(
        screen.getByRole('heading', {
          name: /fix stuff/i,
        })
      ).toBeInTheDocument()
      expect(screen.getByText(/open/i)).toBeInTheDocument()
      const userLink = screen.getByRole('link', {
        name: /landonorris/i,
      })
      expect(userLink).toHaveAttribute('href', '/gh/landonorris')
      const prNumber = screen.getByText(/#5/i)
      expect(prNumber).toBeInTheDocument()
    })
  })
})

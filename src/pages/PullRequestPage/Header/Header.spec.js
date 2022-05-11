import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { usePullQuery } from 'generated'

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
const data = { owner: { repository: { pull } } }

jest.mock('generated')

describe('Header', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    usePullQuery.mockReturnValue({ data })

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
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
      const prNumber = screen.getByText(/#5/i)
      expect(prNumber).toBeInTheDocument()
    })
  })
})

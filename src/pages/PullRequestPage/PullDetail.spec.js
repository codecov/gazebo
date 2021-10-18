import { render, screen } from 'custom-testing-library'
import { MemoryRouter, Route } from 'react-router-dom'

import PullDetail from './PullDetail'
import { usePull } from 'services/pull'

jest.mock('services/pull/hooks')

const pull = {
  pullId: 5,
  title: 'fix stuff',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
}

describe('PullDetail', () => {
  function setup() {
    usePull.mockReturnValue({ data: pull })
    render(
      <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
        <Route path="/:provider/:owner/:repo/pull/:pullid/">
          <PullDetail />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the pr info', () => {
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
      const prLink = screen.getByRole('link', {
        name: /5/,
      })
      expect(prLink).toHaveAttribute(
        'href',
        'https://github.com/test-org/test-repo/pull/5'
      )
    })
  })
})

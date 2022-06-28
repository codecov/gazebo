import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import DirEntry from './DirEntry'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))

describe('DirEntry', () => {
  function setup() {
    useParams.mockReturnValue({
      owner: 'codecov',
      provider: 'gh',
      repo: 'test-repo',
      branch: 'main',
      path: '',
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
        <Route path="/:provider/:owner/:repo/">
          <DirEntry branch="branch" name="dir" path="path/to/directory" />
        </Route>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    setup()
  })

  it('displays the directory name', () => {
    expect(screen.getByText('dir')).toBeInTheDocument()
  })

  it('sets the correct href', () => {
    const dir = screen.getByText('dir')
    expect(dir).toHaveAttribute(
      'href',
      '/gh/codecov/test-repo/tree/branch/path/to/directory/dir'
    )
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import FileView from './Fileviewer'

jest.mock('shared/RawFileviewer', () => () => 'Coderenderer')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

const urlParams = {
  provider: 'gh',
  owner: 'criticalrole',
  repo: 'bellshells',
  ref: 'main',
  path: 'file/to/notthebrave.js',
}

describe('FileView', () => {
  function setup() {
    const { owner, provider, repo, ref, path } = urlParams
    useParams.mockReturnValue({ owner, provider, repo, ref, path })
    render(
      <MemoryRouter
        initialEntries={[
          '/gh/criticalrole/mightynein/blobs/19236709182orym9234879/folder/subfolder/file.js',
        ]}
      >
        <Route path="/:provider/:owner/:repo/blobs/:ref/:path+">
          <FileView />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when there is no coverage data to be shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the coderenderer', () => {
      expect(screen.getByText(/Coderenderer/)).toBeInTheDocument()
    })
  })
})

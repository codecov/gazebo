import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FileView from './Fileviewer'

jest.mock('shared/RawFileviewer', () => () => 'Coderenderer')

describe('FileView', () => {
  function setup() {
    render(
      <MemoryRouter
        initialEntries={[
          '/gh/criticalrole/mightynein/blob/19236709182orym9234879/folder/subfolder/file.js',
        ]}
      >
        <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
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

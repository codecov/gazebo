import { render, screen } from '@testing-library/react'

import MissingFileData from './MissingFileData'

describe('MissingFileData', () => {
  describe('when isSearching is true', () => {
    it('displays no results found', () => {
      render(<MissingFileData isSearching={true} />)

      const noResults = screen.getByText('No results found')
      expect(noResults).toBeInTheDocument()
    })
  })

  describe('when isSearching is false', () => {
    it('displays problem fetching contents', () => {
      render(<MissingFileData isSearching={false} />)

      const problem = screen.getByText(/problem getting repo contents/)
      expect(problem).toBeInTheDocument()
    })
  })
})

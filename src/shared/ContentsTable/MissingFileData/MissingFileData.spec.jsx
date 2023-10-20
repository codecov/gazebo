import { render, screen } from '@testing-library/react'

import MissingFileData from './MissingFileData'

describe('MissingFileData', () => {
  it('displays problem fetching contents', () => {
    render(<MissingFileData />)

    const problem = screen.getByText(/problem getting repo contents/)
    expect(problem).toBeInTheDocument()
  })

  describe('when isSearching is true', () => {
    it('displays no results found', () => {
      render(<MissingFileData isSearching={true} />)

      const noResults = screen.getByText('No results found')
      expect(noResults).toBeInTheDocument()
    })
  })

  describe('when hasFlagsSelected is true', () => {
    it('displays no results with selected flags found', () => {
      render(<MissingFileData hasFlagsSelected={true} />)

      const noResults = screen.getByText(
        "No coverage report uploaded for the selected flags in this branch's head commit"
      )
      expect(noResults).toBeInTheDocument()
    })
  })
})

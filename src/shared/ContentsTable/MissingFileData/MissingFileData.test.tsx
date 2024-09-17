import { render, screen } from '@testing-library/react'

import MissingFileData from './MissingFileData'

describe('MissingFileData', () => {
  it('displays problem fetching contents', () => {
    render(
      <MissingFileData
        isSearching={false}
        hasFlagsSelected={false}
        hasComponentsSelected={false}
      />
    )

    const problem = screen.getByText(/problem getting repo contents/)
    expect(problem).toBeInTheDocument()
  })

  describe('when isSearching is true', () => {
    it('displays no results found', () => {
      render(
        <MissingFileData
          isSearching={true}
          hasComponentsSelected={false}
          hasFlagsSelected={false}
        />
      )

      const noResults = screen.getByText('No results found')
      expect(noResults).toBeInTheDocument()
    })
  })

  describe('when hasFlagsSelected is true', () => {
    it('displays no results with selected flags found', () => {
      render(
        <MissingFileData
          hasFlagsSelected={true}
          hasComponentsSelected={false}
          isSearching={false}
        />
      )

      const noResults = screen.getByText(
        "No coverage report uploaded for the selected flags in this branch's head commit"
      )
      expect(noResults).toBeInTheDocument()
    })
  })

  describe('when hasComponentsSelected is true', () => {
    it('displays no results with selected components found', () => {
      render(
        <MissingFileData
          hasComponentsSelected={true}
          isSearching={false}
          hasFlagsSelected={false}
        />
      )

      const noResults = screen.getByText(
        "No coverage report uploaded for the selected components in this branch's head commit"
      )
      expect(noResults).toBeInTheDocument()
    })
  })

  describe('when hasFlagsSelected and hasComponentsSelected are true', () => {
    it('displays no results with selected flags and components found', () => {
      render(
        <MissingFileData
          hasFlagsSelected={true}
          hasComponentsSelected={true}
          isSearching={false}
        />
      )

      const noResults = screen.getByText(
        "No coverage reported for the selected flag/component combination in this branch's head commit"
      )
      expect(noResults).toBeInTheDocument()
    })
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoContents } from 'services/repoContents/hooks'

import RepoContentsTable from './RepoContentsTable'

jest.mock('services/repoContents/hooks')

const repoContents = [
  {
    name: 'flag2',
    filepath: '',
    percentCovered: 92.78,
    type: 'dir',
  },
  {
    name: 'app.js',
    filepath: 'src',
    percentCovered: 62.53,
    type: 'file',
  },
]

describe('RepoContentsTable', () => {
  function setup({ isLoading = false, data = repoContents } = {}) {
    useRepoContents.mockReturnValue({
      data,
      isLoading,
    })

    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <RepoContentsTable />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders repo contents', () => {
      expect(screen.getByText('flag2')).toBeInTheDocument()
      expect(screen.getByText('app.js')).toBeInTheDocument()
    })

    it('renders coverage', () => {
      expect(screen.getByText(/92.78%/)).toBeInTheDocument()
      expect(screen.getByText(/62.53%/)).toBeInTheDocument()
    })
  })

  describe('when impacted files are in pending state', () => {
    beforeEach(() => {
      setup({ isLoading: true })
    })

    it('renders spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })

  describe('when no data is returned', () => {
    beforeEach(() => {
      setup({ data: [] })
    })

    it('renders empty state message', () => {
      expect(
        screen.getByText(
          /There was a problem getting repo contents from your provider/
        )
      ).toBeInTheDocument()
    })
  })
})

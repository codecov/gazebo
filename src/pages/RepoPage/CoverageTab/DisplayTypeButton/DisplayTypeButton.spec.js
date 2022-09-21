import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useLocationParams } from 'services/navigation'

import DisplayTypeButton from './DisplayTypeButton'

import useRepoContentsTable from '../subroute/RepoContents/hooks'

jest.mock('../subroute/RepoContents/hooks')
jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const mockRepoContents = {
  data: [
    {
      name: 'file1.js',
      filepath: 'file1.js',
      percentCovered: 92.78,
      __typename: 'PathContentFile',
      hits: 4,
      misses: 2,
      lines: 7,
      partials: 1,
    },
    {
      name: 'file2',
      filepath: 'subfolder/folder/file2',
      percentCovered: 92.78,
      __typename: 'PathContentFile',
      hits: 2,
      misses: 5,
      lines: 6,
      partials: 1,
    },
  ],
}

describe('Coverage Tab', () => {
  const mockUpdateParams = jest.fn()
  function setup(repoContents = mockRepoContents) {
    useRepoContentsTable.mockReturnValue(repoContents)
    useLocationParams.mockReturnValue({
      updateParams: mockUpdateParams,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <DisplayTypeButton />
      </QueryClientProvider>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders code tree and file list buttons', () => {
      expect(screen.getByText(/Code tree/)).toBeInTheDocument()
      expect(screen.getByText(/File list/)).toBeInTheDocument()
    })

    it('shows tree as the selected option', () => {
      expect(screen.getByText(/Code tree/)).toHaveClass('bg-ds-blue-darker')
      expect(screen.getByText(/File list/)).not.toHaveClass('bg-ds-blue-darker')
    })
  })

  describe('when list button is clicked', () => {
    beforeEach(() => {
      setup()
      screen
        .getByRole('button', {
          name: /File list/i,
        })
        .click()
    })

    it('renders sets the list button as selected', () => {
      expect(screen.getByText(/Code tree/)).not.toHaveClass('bg-ds-blue-darker')
      expect(screen.getByText(/File list/)).toHaveClass('bg-ds-blue-darker')
    })

    it('renders length of files if data is not empty', () => {
      expect(
        screen.getByText(`${mockRepoContents.data.length} files`)
      ).toBeInTheDocument()
    })
  })

  describe('when tree button is clicked', () => {
    beforeEach(() => {
      setup()
      // This is clicked 2 cause code tree is the default, so we want to change and then click back
      screen
        .getByRole('button', {
          name: /File list/i,
        })
        .click()
      screen
        .getByRole('button', {
          name: /Code tree/i,
        })
        .click()
    })

    it('renders sets the list button as selected', () => {
      expect(screen.getByText(/Code tree/)).toHaveClass('bg-ds-blue-darker')
      expect(screen.getByText(/File list/)).not.toHaveClass('bg-ds-blue-darker')
    })
  })
})

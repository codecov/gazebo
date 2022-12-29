import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useLocationParams } from 'services/navigation'

import DisplayTypeButton from './DisplayTypeButton'

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

const mockUrlParams = {
  displayType: 'tree',
}

describe('Coverage Tab', () => {
  const mockUpdateParams = jest.fn()
  function setup(urlParams = mockUrlParams) {
    useLocationParams.mockReturnValue({
      updateParams: mockUpdateParams,
      params: urlParams,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <DisplayTypeButton dataLength={mockRepoContents.data.length} />
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
      expect(screen.getByText(/Code tree/)).toHaveClass(
        'py-1 px-2 text-sm cursor-pointer rounded-l'
      )
      expect(screen.getByText(/File list/)).not.toHaveClass(
        'py-1 px-2 text-sm cursor-pointer rounded-l'
      )
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
      expect(screen.getByText(/Code tree/)).toHaveClass(
        'py-1 px-2 text-sm cursor-pointer rounded-l'
      )
      expect(screen.getByText(/File list/)).toHaveClass(
        'py-1 px-2 text-sm cursor-pointer bg-ds-blue-darker text-white font-semibold rounded-r'
      )
    })

    it('renders length of files if data is not empty', () => {
      expect(
        screen.getByText(`${mockRepoContents.data.length} total files`)
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
      expect(screen.getByText(/Code tree/)).toHaveClass(
        'py-1 px-2 text-sm cursor-pointer bg-ds-blue-darker text-white font-semibold rounded-l'
      )
      expect(screen.getByText(/File list/)).not.toHaveClass(
        'py-1 px-2 text-sm cursor-pointer rounded-l'
      )
    })
  })

  describe('when url param is list', () => {
    beforeEach(() => {
      const mockUrlParams = {
        displayType: 'list',
      }
      setup(mockUrlParams)
    })

    it('renders list view as selected', () => {
      expect(screen.getByText(/Code tree/)).toHaveClass(
        'py-1 px-2 text-sm cursor-pointer rounded-l'
      )
      expect(screen.getByText(/File list/)).toHaveClass(
        'py-1 px-2 text-sm cursor-pointer bg-ds-blue-darker text-white font-semibold rounded-r'
      )
    })
  })
})

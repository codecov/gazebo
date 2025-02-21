import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mock } from 'vitest'

import { useLocationParams } from 'services/navigation'

import { DisplayTypeButton } from './DisplayTypeButton'

vi.mock('services/navigation', () => {
  const originalModule = vi.importActual('services/navigation')
  return {
    ...originalModule,
    useLocationParams: vi.fn(),
  }
})

const mockedUseLocationParams = useLocationParams as Mock

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
  function setup(urlParams = mockUrlParams) {
    const user = userEvent.setup()
    mockedUseLocationParams.mockReturnValue({
      updateParams: vi.fn(),
      params: urlParams,
    })

    return { user }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders code tree and file list buttons', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <DisplayTypeButton dataLength={mockRepoContents.data.length} />
        </QueryClientProvider>
      )

      const codeTree = screen.getByText(/Code tree/)
      expect(codeTree).toBeInTheDocument()

      const fileList = screen.getByText(/File list/)
      expect(fileList).toBeInTheDocument()
    })

    it('shows tree as the selected option', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <DisplayTypeButton dataLength={mockRepoContents.data.length} />
        </QueryClientProvider>
      )

      const codeTree = screen.getByText(/Code tree/)
      expect(codeTree).toHaveClass('bg-ds-primary-base')

      const fileList = screen.getByText(/File list/)
      expect(fileList).not.toHaveClass('bg-ds-primary-base')
    })
  })

  describe('when list button is clicked', () => {
    it('renders sets the list button as selected', async () => {
      const { user } = setup()
      render(
        <QueryClientProvider client={queryClient}>
          <DisplayTypeButton dataLength={mockRepoContents.data.length} />
        </QueryClientProvider>
      )

      const fileList = screen.getByRole('button', {
        name: /File list/i,
      })
      await user.click(fileList)

      const codeTree = screen.getByText(/Code tree/)
      expect(codeTree).not.toHaveClass('bg-ds-primary-base')

      expect(fileList).toHaveClass('bg-ds-primary-base')
    })

    it('renders length of files if data is not empty', async () => {
      const { user } = setup()
      render(
        <QueryClientProvider client={queryClient}>
          <DisplayTypeButton dataLength={mockRepoContents.data.length} />
        </QueryClientProvider>
      )

      const fileList = screen.getByRole('button', {
        name: /File list/i,
      })
      await user.click(fileList)

      const fileCount = screen.getByText(
        `${mockRepoContents.data.length} total files`
      )
      expect(fileCount).toBeInTheDocument()
    })
  })

  describe('when tree button is clicked', () => {
    it('renders sets the list button as selected', async () => {
      const { user } = setup()
      render(
        <QueryClientProvider client={queryClient}>
          <DisplayTypeButton dataLength={mockRepoContents.data.length} />
        </QueryClientProvider>
      )

      const fileList = screen.getByRole('button', {
        name: /File list/i,
      })
      await user.click(fileList)

      const codeTree = screen.getByRole('button', {
        name: /Code tree/i,
      })
      await user.click(codeTree)

      expect(codeTree).toHaveClass('bg-ds-primary-base')
      expect(fileList).not.toHaveClass('bg-ds-primary-base')
    })
  })

  describe('when url param is list', () => {
    beforeEach(() => {
      setup({
        displayType: 'list',
      })
    })

    it('renders list view as selected', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <DisplayTypeButton dataLength={mockRepoContents.data.length} />
        </QueryClientProvider>
      )

      const codeTree = screen.getByText(/Code tree/)
      expect(codeTree).not.toHaveClass('bg-ds-primary-base')

      const fileList = screen.getByText(/File list/)
      expect(fileList).toHaveClass('bg-ds-primary-base')
    })
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
// eslint-disable-next-line no-restricted-imports
import { type Dictionary } from 'lodash'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { ColorBar, VirtualFileRenderer } from './VirtualFileRenderer'

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const scrollToMock = jest.fn()
window.scrollTo = scrollToMock

class ResizeObserver {
  callback = (x: any) => null

  constructor(callback: any) {
    this.callback = callback
  }

  observe() {
    this.callback([{ target: { getAttribute: () => ({ scrollWidth: 100 }) } }])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}
global.window.ResizeObserver = ResizeObserver

const code = `<Breadcrumb
    paths={[
    { pageName: 'owner', text: owner },
    { pageName: 'repo', text: repo },
    ...treePaths,
    {..props}
    ]}
/>`

const coverageData = {
  0: 'H',
  1: 'M',
  2: 'P',
  3: 'H',
  4: 'M',
  5: 'P',
} as unknown as Dictionary<'H' | 'M' | 'P'>

let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (initialEntry = '/'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Route path="/">{children}</Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </MemoryRouter>
  )

describe('VirtualFileRenderer', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  it('renders the code', () => {
    render(
      <VirtualFileRenderer
        code={code}
        coverage={coverageData}
        fileName="tsx"
      />,
      {
        wrapper: wrapper(),
      }
    )

    const codeBlock = screen.getByText(/<Breadcrumb/)
    expect(codeBlock).toBeInTheDocument()
  })

  it('renders line numbers', () => {
    render(
      <VirtualFileRenderer
        code={code}
        coverage={coverageData}
        fileName="tsx"
      />,
      {
        wrapper: wrapper(),
      }
    )

    const lineNumbers = screen.getAllByText(/\d+/)
    expect(lineNumbers).toHaveLength(8)
  })

  describe('covered lines', () => {
    it('uses the correct color', () => {
      render(
        <VirtualFileRenderer
          code={code}
          coverage={coverageData}
          fileName="tsx"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const coveredLine = screen.getByText(0)
      expect(coveredLine).toBeInTheDocument()
      expect(coveredLine).toHaveClass('bg-ds-coverage-covered')
    })
  })

  describe('uncovered lines', () => {
    it('uses the correct color', () => {
      render(
        <VirtualFileRenderer
          code={code}
          coverage={coverageData}
          fileName="tsx"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const uncoveredLine = screen.getByText(1)
      expect(uncoveredLine).toBeInTheDocument()
      expect(uncoveredLine).toHaveClass('bg-ds-coverage-uncovered')
    })
  })

  describe('partial lines', () => {
    it('uses the correct color', () => {
      render(
        <VirtualFileRenderer
          code={code}
          coverage={coverageData}
          fileName="tsx"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const partialLine = screen.getByText(2)
      expect(partialLine).toBeInTheDocument()
      expect(partialLine).toHaveClass('bg-ds-coverage-partial')
    })
  })

  describe('toggling pointer events', () => {
    let requestAnimationFrameSpy: jest.SpyInstance
    let cancelAnimationFrameSpy: jest.SpyInstance
    let dateNowSpy: jest.SpyInstance

    beforeEach(() => {
      requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')
      cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame')
      dateNowSpy = jest.spyOn(Date, 'now')
    })

    afterEach(() => {
      requestAnimationFrameSpy.mockRestore()
      cancelAnimationFrameSpy.mockRestore()
      dateNowSpy.mockRestore()
      jest.clearAllMocks()
    })

    it('disables pointer events on scroll', async () => {
      dateNowSpy
        .mockImplementationOnce(() => 1000)
        .mockImplementationOnce(() => 2000)
      requestAnimationFrameSpy.mockImplementation((cb) => {
        setTimeout(() => {
          cb()
        }, 50)
        return 1
      })

      render(
        <VirtualFileRenderer
          code={code}
          coverage={coverageData}
          fileName="tsx"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const lines = await screen.findAllByText(
        /{ pageName: 'repo', text: repo },/
      )
      expect(lines[0]).toBeInTheDocument()

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      const codeRenderer = screen.getByTestId('virtual-file-renderer')
      await waitFor(() =>
        expect(codeRenderer).toHaveStyle('pointer-events: none')
      )
    })

    it('reset pointer events after scroll', async () => {
      dateNowSpy
        .mockImplementationOnce(() => 1000)
        .mockImplementationOnce(() => 2000)
      requestAnimationFrameSpy.mockImplementation((cb) => {
        setTimeout(() => {
          cb()
        }, 50)
        return 1
      })

      render(
        <VirtualFileRenderer
          code={code}
          coverage={coverageData}
          fileName="tsx"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const lines = await screen.findAllByText(
        /{ pageName: 'repo', text: repo },/
      )
      expect(lines[0]).toBeInTheDocument()

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      const codeRenderer = screen.getByTestId('virtual-file-renderer')
      await waitFor(() =>
        expect(codeRenderer).toHaveStyle('pointer-events: none')
      )
      await waitFor(() =>
        expect(codeRenderer).toHaveStyle('pointer-events: auto')
      )
    })

    it('calls cancelAnimationFrame', async () => {
      dateNowSpy
        .mockImplementationOnce(() => 1000)
        .mockImplementationOnce(() => 2000)
      requestAnimationFrameSpy.mockImplementation((cb) => {
        setTimeout(() => {
          cb()
        }, 50)
        return 1
      })

      const { container } = render(
        <VirtualFileRenderer
          code={code}
          coverage={coverageData}
          fileName="tsx"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const lines = await screen.findAllByText(
        /{ pageName: 'repo', text: repo },/
      )
      expect(lines[0]).toBeInTheDocument()

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      // eslint-disable-next-line testing-library/no-container
      container.remove()
      await fireEvent.scroll(window, { target: { scrollX: 100 } })
      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      await waitFor(() => expect(cancelAnimationFrameSpy).toHaveBeenCalled())
    })
  })

  describe('highlighted line', () => {
    describe('user clicks on line number', () => {
      it('updates the URL', async () => {
        const { user } = setup()
        render(
          <VirtualFileRenderer
            code={code}
            coverage={coverageData}
            fileName="tsx"
          />,
          {
            wrapper: wrapper(),
          }
        )

        const line = screen.getByText(0)
        await user.click(line)

        await waitFor(() => expect(testLocation.hash).toBe('#L0'))
      })

      it('highlights the line', async () => {
        const { user } = setup()
        render(
          <VirtualFileRenderer
            code={code}
            coverage={coverageData}
            fileName="tsx"
          />,
          {
            wrapper: wrapper(),
          }
        )

        const line = screen.getByText(0)
        await user.click(line)

        const bar = await screen.findByTestId('covered-bar')
        expect(bar).toBeInTheDocument()
        expect(bar).toHaveClass('bg-ds-coverage-covered')
      })

      describe('user clicks the line again', () => {
        it('clears the line', async () => {
          const { user } = setup()
          render(
            <VirtualFileRenderer
              code={code}
              coverage={coverageData}
              fileName="tsx"
            />,
            {
              wrapper: wrapper(),
            }
          )

          const line = screen.getByText(0)
          await user.click(line)
          await waitFor(() => expect(testLocation.hash).toBe('#L0'))
          await user.click(line)
          await waitFor(() => expect(testLocation.hash).toBe(''))
        })
      })
    })
  })
})

describe('ColorBar', () => {
  describe('when there is no coverage data', () => {
    it('does not render', () => {
      const { container } = render(
        <ColorBar coverage={undefined} locationHash="" lineNumber={0} />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('coverage value is H', () => {
    it('renders with covered color', () => {
      render(<ColorBar coverage={'H'} locationHash="" lineNumber={0} />)

      const bar = screen.getByTestId('covered-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-covered')
    })
  })

  describe('coverage value is M', () => {
    it('renders with uncovered color', () => {
      render(<ColorBar coverage={'M'} locationHash="" lineNumber={0} />)

      const bar = screen.getByTestId('uncovered-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-uncovered')
    })
  })

  describe('coverage value is P', () => {
    it('renders with partial color', () => {
      render(<ColorBar coverage={'P'} locationHash="" lineNumber={0} />)

      const bar = screen.getByTestId('partial-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-partial')
    })
  })

  describe('highlighted line', () => {
    it('renders with highlighted color', () => {
      render(<ColorBar coverage={'P'} locationHash="#L18" lineNumber={18} />)

      const bar = screen.getByTestId('highlighted-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-blue-medium')
    })
  })
})

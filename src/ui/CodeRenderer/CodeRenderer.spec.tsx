import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import CodeRenderer from './CodeRenderer'

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const code = `
<Breadcrumb
    paths={[
    { pageName: 'owner', text: owner },
    { pageName: 'repo', text: repo },
    ...treePaths,
    {..props}
    ]}
/>
`

describe('CodeRenderer', () => {
  describe('Line Component', () => {
    it('renders', () => {
      render(
        <CodeRenderer
          code={code}
          fileName="sample.py"
          rendererType="SINGLE_LINE"
          LineComponent={({ i }) => (
            <tr key={i}>
              <td>this is a random line test component {i + 1}</td>
            </tr>
          )}
        />
      )

      const lines = screen.getAllByText(/this is a random line test component/)
      expect(lines[0]).toBeInTheDocument()
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
        <CodeRenderer
          code={code}
          fileName="sample.py"
          rendererType="SINGLE_LINE"
          LineComponent={({ i }) => (
            <tr key={i}>
              <td>this is a random line test component {i + 1}</td>
            </tr>
          )}
        />
      )

      const lines = await screen.findAllByText(
        /this is a random line test component/
      )
      expect(lines[0]).toBeInTheDocument()

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      const table = screen.getByRole('table')
      await waitFor(() => expect(table).toHaveStyle('pointer-events: none'))
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
        <CodeRenderer
          code={code}
          fileName="sample.py"
          rendererType="SINGLE_LINE"
          LineComponent={({ i }) => (
            <tr key={i}>
              <td>this is a random line test component {i + 1}</td>
            </tr>
          )}
        />
      )

      const lines = await screen.findAllByText(
        /this is a random line test component/
      )
      expect(lines[0]).toBeInTheDocument()

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      const table = screen.getByRole('table')
      await waitFor(() => expect(table).toHaveStyle('pointer-events: none'))
      await waitFor(() => expect(table).toHaveStyle('pointer-events: auto'))
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
        <CodeRenderer
          code={code}
          fileName="sample.py"
          rendererType="SINGLE_LINE"
          LineComponent={({ i }) => (
            <tr key={i}>
              <td>this is a random line test component {i + 1}</td>
            </tr>
          )}
        />
      )

      const lines = await screen.findAllByText(
        /this is a random line test component/
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
})

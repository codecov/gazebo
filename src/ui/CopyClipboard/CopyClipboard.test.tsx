import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CopyClipboard } from './CopyClipboard'

vi.mock('copy-to-clipboard', () => ({ default: () => true }))

describe('CopyClipboard', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  function setup() {
    // This is a bit of a hack to get Vitest fake timers setup with userEvents properly
    // GH Issue: https://github.com/testing-library/react-testing-library/issues/1197#issuecomment-1693824628
    globalThis.jest = {
      ...globalThis.jest,
      advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
    }

    const user = userEvent.setup({
      advanceTimers: globalThis.jest.advanceTimersByTime,
    })

    return { user }
  }

  it('renders the button with clipboard icon', () => {
    render(<CopyClipboard value="to be copied" />)

    const clipboard = screen.getByLabelText('Copy to be copied')
    expect(clipboard).toBeInTheDocument()
  })

  describe('when the user clicks on the button to copy', () => {
    it('renders the success icon', async () => {
      const { user } = setup()
      render(<CopyClipboard value="to be copied" />)

      const button = screen.getByRole('button', {
        name: 'Copy to be copied',
      })
      await user.click(button)

      const success = screen.getByTestId('check')
      expect(success).toBeInTheDocument()
    })

    describe('renders clipboard after delay', () => {
      it('goes back to original state', async () => {
        const { user } = setup()
        render(<CopyClipboard value="to be copied" />)

        const button = screen.getByRole('button', {
          name: 'Copy to be copied',
        })
        await user.click(button)

        const success = await screen.findByTestId('check')
        expect(success).toBeInTheDocument()

        act(() => vi.advanceTimersByTime(1500))

        const clipboard = await screen.findByTestId('clipboardCopy')

        expect(clipboard).toBeInTheDocument()
      })
    })

    describe('when no label prop is passed', () => {
      it('uses value in aria-label', async () => {
        render(<CopyClipboard value="asdf" />)

        const clipboard = await screen.findByLabelText('Copy asdf')
        expect(clipboard).toBeInTheDocument()
      })
    })

    describe('when label prop is passed', () => {
      it('uses label as the aria-label attribute on the button', async () => {
        render(<CopyClipboard value="asdf" label="Aria label copy" />)

        const clipboard = await screen.findByLabelText('Aria label copy')
        expect(clipboard).toBeInTheDocument()
      })
    })

    describe('when onClick prop is set', () => {
      it('calls the function when button is clicked', async () => {
        const { user } = setup()
        const callback = vi.fn()
        render(<CopyClipboard value="asdf" onClick={callback} />)

        const button = screen.getByRole('button', {
          name: /copy/i,
        })
        await user.click(button)

        await waitFor(() => expect(callback).toHaveBeenCalledWith('asdf'))
      })
    })
  })
})

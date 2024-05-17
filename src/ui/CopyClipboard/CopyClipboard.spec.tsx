import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { CopyClipboard } from './CopyClipboard'

jest.mock('copy-to-clipboard', () => () => true)

describe('CopyClipboard', () => {
  beforeAll(() => jest.useFakeTimers())
  afterAll(() => jest.useRealTimers())

  function setup() {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    return { user }
  }

  it('renders the button with clipboard icon', () => {
    render(<CopyClipboard value="to be copied" />)

    const clipboard = screen.getByText(/clipboard-copy/, { exact: true })
    expect(clipboard).toBeInTheDocument()
  })

  describe('when the user clicks on the button to copy', () => {
    it('renders the success icon', async () => {
      const { user } = setup()
      render(<CopyClipboard value="to be copied" />)

      const button = screen.getByRole('button', {
        name: /copy/i,
      })
      await user.click(button)

      const success = screen.getByText(/check/, { exact: true })
      expect(success).toBeInTheDocument()
    })

    describe('renders clipboard after delay', () => {
      it('goes back to original state', async () => {
        const { user } = setup()
        render(<CopyClipboard value="to be copied" />)

        const button = screen.getByRole('button', {
          name: /copy/i,
        })
        await user.click(button)

        const success = await screen.findByText(/check/, { exact: true })
        expect(success).toBeInTheDocument()

        act(() => jest.advanceTimersByTime(1500))

        const clipboard = await screen.findByText(/clipboard-copy/, {
          exact: true,
        })

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
  })
})

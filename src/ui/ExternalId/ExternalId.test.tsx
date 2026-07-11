import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ExternalId from './ExternalId'

const mocks = vi.hoisted(() => ({
  copy: vi.fn(() => true),
}))

vi.mock('copy-to-clipboard', () => ({ default: mocks.copy }))

describe('ExternalId', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    mocks.copy.mockClear()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  function setup() {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    return { user }
  }

  describe('when no externalId is passed', () => {
    it('renders nothing', () => {
      const { container } = render(<ExternalId externalId={null} />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when an externalId is passed', () => {
    it('renders the id with the default label', () => {
      render(<ExternalId externalId="abc-123" />)

      const text = screen.getByText(/ID: abc-123/)
      expect(text).toBeInTheDocument()
    })

    it('renders a custom label when provided', () => {
      render(<ExternalId externalId="abc-123" label="Support ID" />)

      const text = screen.getByText(/Support ID: abc-123/)
      expect(text).toBeInTheDocument()
    })
  })

  describe('when the user clicks the value', () => {
    it('copies the full external id', async () => {
      const { user } = setup()
      render(<ExternalId externalId="abc-123" />)

      const button = screen.getByRole('button', { name: /Copy ID abc-123/ })
      await user.click(button)

      expect(mocks.copy).toHaveBeenCalledWith('abc-123')
    })

    it('shows a success icon that reverts after the delay', async () => {
      const { user } = setup()
      render(<ExternalId externalId="abc-123" />)

      const button = screen.getByRole('button', { name: /Copy ID abc-123/ })
      await user.click(button)

      const success = await screen.findByTestId('copied')
      expect(success).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(1500))

      const clipboard = await screen.findByTestId('copy')
      expect(clipboard).toBeInTheDocument()
    })
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InstructionBox from '.'

describe('InstructionBox', () => {
  function setup() {
    render(<InstructionBox />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders Linux button', () => {
      const btn = screen.getByRole('button', { name: 'Linux' })
      expect(btn).toBeInTheDocument()
    })

    it('renders MacOS button', () => {
      const btn = screen.getByRole('button', { name: 'macOS' })
      expect(btn).toBeInTheDocument()
    })

    it('renders Alpine Linux button', () => {
      const btn = screen.getByRole('button', { name: 'Alpine Linux' })
      expect(btn).toBeInTheDocument()
    })

    it('renders Windows button', () => {
      const btn = screen.getByRole('button', { name: 'Windows' })
      expect(btn).toBeInTheDocument()
    })
  })

  describe('when rendered any tab but not windows', () => {
    beforeEach(() => {
      setup()
    })

    it('does not render the windows instruction', () => {
      const instruction = screen.queryByText(/$ProgressPreference /)
      expect(instruction).not.toBeInTheDocument()
    })

    it('renders the other instructions', () => {
      const instruction = screen.queryByText(/curl/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on windows', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the windows instruction', () => {
      userEvent.click(screen.getByRole('button', { name: 'Windows' }))
      const instruction = screen.queryByText(/\$ProgressPreference/)
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on linux', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the linux instruction', () => {
      userEvent.click(screen.getByRole('button', { name: 'Linux' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/linux\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Alpine', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the Alpine instruction', () => {
      userEvent.click(screen.getByRole('button', { name: 'Alpine Linux' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/alpine\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })

  describe('when click on Mac', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the Mac instruction', () => {
      userEvent.click(screen.getByRole('button', { name: 'macOS' }))
      const instruction = screen.queryByText(
        /curl -Os https:\/\/uploader.codecov.io\/latest\/macos\/codecov/
      )
      expect(instruction).toBeInTheDocument()
    })
  })
})

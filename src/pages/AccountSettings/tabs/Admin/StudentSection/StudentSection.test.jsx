import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import StudentCard from './StudentSection.jsx'

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>

describe('StudentSection', () => {
  describe('when the user is active student', () => {
    it('renders the student section', () => {
      render(<StudentCard isStudent />, { wrapper })

      const p = screen.getByText(/Your account is marked as a student/)
      expect(p).toBeInTheDocument()
    })
  })

  describe('when the user is not a student', () => {
    it('does not render student section', () => {
      const { container } = render(<StudentCard isStudent={false} />, {
        wrapper,
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})

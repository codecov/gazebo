import { render, screen } from '@testing-library/react'

import StudentCard from './StudentCard'

describe('StudentCard', () => {
  let wrapper

  function setup(currentUser) {
    wrapper = render(<StudentCard currentUser={currentUser} />)
  }

  describe('when the user never was admin', () => {
    beforeEach(() => {
      setup({
        user: {
          student: false,
          studentCreatedAt: null,
          studentUpdatedAt: null,
        },
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user is active student', () => {
    beforeEach(() => {
      setup({
        user: {
          student: true,
          studentCreatedAt: '2020-09-08T10:45:06Z',
          studentUpdatedAt: null,
        },
      })
    })

    it('renders the student information', () => {
      expect(screen.getByText(/Status/)).toBeInTheDocument()
      expect(screen.getByText(/Active/)).toBeInTheDocument()
      expect(screen.getByText(/Since/)).toBeInTheDocument()
      expect(screen.getByText(/September 8th 2020/)).toBeInTheDocument()
    })
  })

  describe('when the user is former student', () => {
    beforeEach(() => {
      setup({
        user: {
          student: false,
          studentCreatedAt: '2020-09-08T10:45:06Z',
          studentUpdatedAt: '2020-10-08T10:45:06Z',
        },
      })
    })

    it('renders the student information', () => {
      expect(screen.getByText(/Status/)).toBeInTheDocument()
      expect(screen.getByText(/Inactive/)).toBeInTheDocument()
      expect(screen.getByText(/Started/)).toBeInTheDocument()
      expect(screen.getByText(/September 8th 2020/)).toBeInTheDocument()
      expect(screen.getByText(/Ended/)).toBeInTheDocument()
      expect(screen.getByText(/October 8th 2020/)).toBeInTheDocument()
    })
  })
})

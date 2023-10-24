import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Coverage from '.'

jest.mock('services/repo')

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/pulls']}>
    <Route path="/:provider/:owner/:repo/pulls">{children}</Route>
  </MemoryRouter>
)

describe('Coverage', () => {
  describe('when rendered with a pull coverage', () => {
    it('renders id of the pull', () => {
      render(
        <Coverage
          head={{ totals: { percentCovered: 45 } }}
          state="MERGED"
          pullId={746}
        />,
        {
          wrapper,
        }
      )

      const id = screen.getByText(/#746/)
      expect(id).toBeInTheDocument()
    })

    it('renders coverage of pull', () => {
      render(
        <Coverage
          head={{ totals: { percentCovered: 45 } }}
          state="MERGED"
          pullId={746}
        />,
        {
          wrapper,
        }
      )

      const coverage = screen.getByText(/45.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders coverage state', () => {
      render(
        <Coverage
          head={{ totals: { percentCovered: 45 } }}
          state="MERGED"
          pullId={746}
        />,
        {
          wrapper,
        }
      )

      const coverage = screen.getByText(/merge.svg/)
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no coverage in pull', () => {
    it('renders id of the pull', () => {
      render(<Coverage head={{}} state="MERGED" pullId={746} />, {
        wrapper,
      })

      const id = screen.getByText(/#746/)
      expect(id).toBeInTheDocument()
    })

    it('renders no reports text', () => {
      render(<Coverage head={{}} state="MERGED" pullId={746} />, {
        wrapper,
      })

      const text = screen.getByText('No report uploaded yet')
      expect(text).toBeInTheDocument()
    })
  })
})

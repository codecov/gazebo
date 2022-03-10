import { useCrumbs, useSetCrumbs } from './context'
import { fireEvent, repoPageRender, screen, waitFor } from './repo-jest-setup'

const TestComponent = () => {
  const crumbs = useCrumbs()
  const setCrumb = useSetCrumbs()

  return (
    <div>
      <ul>
        {crumbs.map(({ text, children }, i) => (
          <li key={i}>{text || children}</li>
        ))}
      </ul>
      <button onClick={() => setCrumb([{ pageName: 'added' }])}>
        set crumb
      </button>
    </div>
  )
}

describe('Repo breadcrumb context', () => {
  function setup() {
    repoPageRender({ renderRoot: () => <TestComponent /> })
  }
  describe('when called', () => {
    beforeEach(() => {
      setup()
    })
    it('crumbs return the owner and repo value', () => {
      expect(screen.getByText('codecov')).toBeInTheDocument()
      expect(screen.getByText('test-repo')).toBeInTheDocument()
    })

    it('setCrumb can update the context', () => {
      const button = screen.getByRole('button')
      fireEvent.click(button)
      waitFor(() => expect(screen.getByText('added')).toBeInTheDocument())
    })
  })
})

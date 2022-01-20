import { repoPageRender, screen, fireEvent, waitFor } from './repo-jest-setup'

import { useCrumbs, useSetCrumbs } from './context'

const TestComponent = () => {
  const crumbs = useCrumbs()
  const setCrumb = useSetCrumbs()

  return (
    <div>
      <ul>
        {crumbs.map(({ text }, i) => (
          <li key={i}>{text}</li>
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

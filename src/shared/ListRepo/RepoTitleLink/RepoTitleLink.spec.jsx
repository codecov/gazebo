import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { DEMO_REPO } from 'shared/utils/demo'

import RepoTitleLink from './RepoTitleLink'

describe('RepoTitleLink', () => {
  const repo = {
    name: 'repo1',
    author: {
      username: 'owner1',
    },
    private: true,
    activated: true,
    active: true,
  }

  function setup(props) {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <RepoTitleLink {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the repository is private', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: true,
        },
        showRepoOwner: false,
        pageName: 'repo',
        disabledLink: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('renders the private tag', () => {
      expect(screen.getByText(/Private/)).toBeInTheDocument()
    })
  })

  describe('when the repo is public', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: false,
        },
        showRepoOwner: false,
        pageName: 'repo',
        disabledLink: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('does not render the private tag', () => {
      expect(screen.queryByText(/Private/)).not.toBeInTheDocument()
    })
  })

  describe('when the repository is deactivated and active is true', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: false,
          activated: false,
        },
        showRepoOwner: false,
        pageName: 'repo',
        disabledLink: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('renders the deactivated tag', () => {
      expect(screen.getByText(/Deactivated/)).toBeInTheDocument()
    })
  })

  describe('when the repository is deactivated and active is false', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          private: false,
          activated: false,
          active: false,
        },
        showRepoOwner: false,
        pageName: 'repo',
        disabledLink: false,
      })
    })

    it('renders the title', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
    })

    it('does not render the deactivated tag', () => {
      expect(screen.queryByText(/Deactivated/)).not.toBeInTheDocument()
    })
  })

  describe('when the repo is not setup and the user does not belong to the org', () => {
    describe('the repo is active', () => {
      describe('the repo is activated', () => {
        beforeEach(() => {
          setup({
            repo: {
              ...repo,
              private: false,
              active: true,
              activated: true,
            },
            showRepoOwner: false,
            pageName: 'repo',
            disabledLink: true,
          })
        })

        it('renders the title', () => {
          expect(screen.getByText(/repo1/)).toBeInTheDocument()
        })

        it('does not provide an href', () => {
          const entry = screen.getByText(/repo1/)
          expect(entry).not.toHaveAttribute('href')
        })
      })

      describe('the repo is deactivated', () => {
        beforeEach(() => {
          setup({
            repo: {
              ...repo,
              private: false,
              active: true,
              activated: false,
            },
            showRepoOwner: false,
            pageName: 'repo',
            disabledLink: true,
          })
        })

        it('renders the title', () => {
          expect(screen.getByText(/repo1/)).toBeInTheDocument()
        })

        it('does not provide an href', () => {
          const entry = screen.getByText(/repo1/)
          expect(entry).not.toHaveAttribute('href')
        })

        it('renders the deactivated tag', () => {
          expect(screen.getByText(/Deactivated/)).toBeInTheDocument()
        })
      })
    })

    describe('the repo is not active', () => {
      beforeEach(() => {
        setup({
          repo: {
            ...repo,
            private: false,
            active: false,
            activated: true,
          },
          showRepoOwner: false,
          pageName: 'repo',
          disabledLink: true,
        })
      })

      it('renders the title', () => {
        expect(screen.getByText(/repo1/)).toBeInTheDocument()
      })

      it('does not provide an href', () => {
        const entry = screen.getByText(/repo1/)
        expect(entry).not.toHaveAttribute('href')
      })
    })
  })

  describe('when showRepoOwner is true', () => {
    beforeEach(() => {
      setup({
        repo,
        showRepoOwner: true,
        pageName: 'repo',
        disabledLink: false,
      })
    })

    it('renders the org name', () => {
      expect(screen.getByText(/owner1/)).toBeInTheDocument()
    })
  })

  describe('when showRepoOwner is false', () => {
    beforeEach(() => {
      setup({
        repo,
        showRepoOwner: false,
        pageName: 'repo',
        disabledLink: false,
      })
    })

    it('desont render the org name', () => {
      expect(screen.queryByText(/owner1/)).not.toBeInTheDocument()
    })
  })

  describe('when the repo is a demo repo', () => {
    beforeEach(() => {
      setup({
        repo: {
          ...repo,
          isDemo: true,
          name: DEMO_REPO.displayName,
        },
        showRepoOwner: false,
        pageName: 'demoRepo',
        disabledLink: false,
      })
    })

    it('renders a System generated tag', () => {
      expect(screen.getByText(/System generated/)).toBeInTheDocument()
    })

    it('is titled Codecov demo', () => {
      expect(screen.getByText(/Codecov demo/)).toBeInTheDocument()
    })
  })
})

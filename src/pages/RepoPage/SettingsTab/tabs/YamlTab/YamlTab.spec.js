import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo } from 'services/repo'

import YamlTab from './YamlTab'

jest.mock('services/repo')
const queryClient = new QueryClient()

describe('YamlTab', () => {
    function setup() {
        useRepo.mockReturnValue({ data: { repository: { yaml: 'test' } } })

        render(
            <MemoryRouter initialEntries={['/gh/codecov/codecov-client/yaml']}>
                <QueryClientProvider client={queryClient}>
                    <Route path="/:provider/:owner/:repo/yaml">
                        <YamlTab />
                    </Route>
                </QueryClientProvider>
            </MemoryRouter>
        )
    }

    describe('renders yaml section', () => {
        beforeEach(() => {
            setup()
        })

        it('renders Repository Yaml compoenent', () => {
            const title = screen.getByText(/Repository yaml/)
            expect(title).toBeInTheDocument()
        })

        it('renders body', () => {
            const p = screen.getByText(
                'This is the default yaml for the current repository, after validation. This yaml takes precedence over the global yaml, but will be overwritten if a yaml change is included in a commit.'
            )
            expect(p).toBeInTheDocument()
        })
    })
})

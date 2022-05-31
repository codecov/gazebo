import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import DangerZone from './DangerZone'

const queryClient = new QueryClient()

describe('DangerZone', () => {
    function setup() {
        render(
            <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
                <QueryClientProvider client={queryClient}>
                    <Route path="/:provider/:owner/:repo/settings">
                        <DangerZone />
                    </Route>
                </QueryClientProvider>
            </MemoryRouter>
        )
    }

    describe('when rendered', () => {
        beforeEach(() => {
            setup()
        })

        it('renders header', () => {
            const h = screen.getByText(/Danger Zone/)
            expect(h).toBeInTheDocument()
        })

        it('renders the body', () => {
            const body = screen.getByText(/Erase repo coverage data and pause upload ability/)
            expect(body).toBeInTheDocument()
        })
    })
})

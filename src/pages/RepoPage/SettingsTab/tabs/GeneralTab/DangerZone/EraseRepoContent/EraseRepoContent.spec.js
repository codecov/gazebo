import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { useEraseRepoContent } from 'services/repo'

import EraseRepoContent from './EraseRepoContent'

jest.mock('services/repo')
jest.mock('services/toastNotification')

describe('EraseRepoContent', () => {
    const mutate = jest.fn()
    const addNotification = jest.fn()

    function setup() {
        useAddNotification.mockReturnValue(addNotification)
        useEraseRepoContent.mockReturnValue({
            isLoading: false,
            mutate,
        })

        render(
            <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
                <Route path="/:provider/:owner/:repo/settings">
                    <EraseRepoContent />
                </Route>
            </MemoryRouter>
        )
    }

    describe('renders EraseRepoContent componenet', () => {
        beforeEach(() => {
            setup()
        })
        it('renders title', () => {
            const title = screen.getByText(/Erase repo coverage content/)
            expect(title).toBeInTheDocument()
        })
        it('renders body', () => {
            const p = screen.getByText('This will remove all coverage reporting from the repo')
            expect(p).toBeInTheDocument()
        })

        it('renders regenerate button', () => {
            expect(
                screen.getByRole('button', { name: 'Erase Content' })
            ).toBeInTheDocument()
        })
    })

    describe('when the user clicks on erase content button', () => {
        beforeEach(() => {
            setup()
            act(() =>
                userEvent.click(screen.getByRole('button', { name: 'Erase Content' }))
            )
        })

        it('displays Erase Content Modal', () => {
            expect(screen.getByText('Are you sure you want to erase the repo coverage content?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'This will erase repo coverage content should erase all coverage data contained in the repo. This action is irreversible and if you proceed, you will permanently erase any historical code coverage in Codecov for this repository.'
                )
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Erase Content' })
            ).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
        })

        describe('when user clicks on Cancel button', () => {
            beforeEach(() => {
                act(() =>
                    userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
                )
            })
            it('does not call the mutation', () => {
                expect(mutate).not.toHaveBeenCalled()
            })
        })
    })

    describe('when user clicks on Erase Content button', () => {
        beforeEach(async () => {
            setup('new token')
            await act(async () => {
                await userEvent.click(
                    screen.getByRole('button', { name: 'Erase Content' })
                )
                userEvent.click(
                    screen.getByRole('button', { name: 'Erase Content' })
                )
            })
        })
        it('calls the mutation', () => {
            expect(mutate).toHaveBeenCalled()
        })
    })

    describe('when mutation is not successful', () => {
        beforeEach(async () => {
            setup('new token')
            await act(async () => {
                await userEvent.click(
                    screen.getByRole('button', { name: 'Erase Content' })
                )
                userEvent.click(
                    screen.getByRole('button', { name: 'Erase Content' })
                )
                mutate.mock.calls[0][1].onError()
            })
        })
        it('calls the mutation', () => {
            expect(mutate).toHaveBeenCalled()
        })

        it('adds an error notification', () => {
            expect(addNotification).toHaveBeenCalledWith({
                type: 'error',
                text: 'We were unable to erase this repo\'s content',
            })
        })
    })
})

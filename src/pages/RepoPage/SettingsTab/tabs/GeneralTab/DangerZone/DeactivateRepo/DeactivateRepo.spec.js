import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { useRepo, useUpdateRepo } from 'services/repo'

import DeactivateRepo from './DeactivateRepo'

jest.mock('services/repo')
jest.mock('services/toastNotification')

describe('DeactivateRepo', () => {
    const mutate = jest.fn()
    const addNotification = jest.fn()

    function setup(active = false) {
        useAddNotification.mockReturnValue(addNotification)
        useUpdateRepo.mockReturnValue({
            isLoading: false,
            mutate,
            data: {
                active
            }
        })
        useRepo.mockReturnValue({
            repository: { active }
        })

        render(
            <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
                <Route path="/:provider/:owner/:repo/settings">
                    <DeactivateRepo />
                </Route>
            </MemoryRouter>
        )
    }

    describe('renders DeactivateRepo componenet', () => {
        beforeEach(() => {
            setup()
        })
        it('renders title', () => {
            const title = screen.getByText(/Activate repo/)
            expect(title).toBeInTheDocument()
        })

        it('renders Activate Repo button', () => {
            expect(
                screen.getByRole('button', { name: 'Activate' })
            ).toBeInTheDocument()
        })
    })

    describe('when the user clicks on Activate button', () => {
        beforeEach(() => {
            setup()
            act(() =>
                userEvent.click(screen.getByRole('button', { name: 'Activate' }))
            )
        })

        it('calls the mutation', () => {
            expect(mutate).toHaveBeenCalled()
        })
    })

    describe('when mutation data has active set to true', () => {
        beforeEach(() => {
            setup(true)
        })

        it('displays deactive button', () => {
            expect(
                screen.getByRole('button', { name: 'Deactivate' })
            ).toBeInTheDocument()
        })

        it('displays the warning', () => {
            const warning = screen.getByText('This will prevent any further uploads')
            expect(warning).toBeInTheDocument()
        })

        describe('when the user clicks on Deactivate button', () => {
            beforeEach(() => {
                act(() =>
                    userEvent.click(screen.getByRole('button', { name: 'Deactivate' }))
                )
            })

            it('displays Deactivate Repo Modal', () => {
                expect(screen.getByText('Are you sure you want to deactivate the repo?')).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Deactivate Repo will deactivate a repo and prevent the upload of coverage information to that repo going forward. You will be able to reactivate the repo at any time.'
                    )
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: 'Deactivate repo' })
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

            describe('when user clicks on Deactivate button', () => {
                beforeEach(async () => {
                    await act(async () => {
                        userEvent.click(
                            screen.getByRole('button', { name: 'Deactivate repo' })
                        )
                    })
                })
                it('calls the mutation', () => {
                    expect(mutate).toHaveBeenCalled()
                })
            })
        })
    })

    describe('when activate mutation is not successful', () => {
        beforeEach(async () => {
            setup()
            await act(async () => {
                await userEvent.click(
                    screen.getByRole('button', { name: 'Activate' })
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
                text: 'We were not able to activate this repo',
            })
        })
    })

    describe('when deactivate mutation is not successful', () => {
        beforeEach(async () => {
            setup(true)
            await act(async () => {
                await userEvent.click(
                    screen.getByRole('button', { name: 'Deactivate' })
                )
                await userEvent.click(
                    screen.getByRole('button', { name: 'Deactivate repo' })
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
                text: 'We were not able to deactivate this repo',
            })
        })
    })
})

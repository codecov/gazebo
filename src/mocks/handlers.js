import { randomOrgCoverageHandler } from 'services/charts/mocks'
import { randomAccountDetailsHandler } from 'services/account/mocks'
import { randomUsersHandler } from 'services/users/mocks'
import { commitErrored } from 'services/commit/mocks'

export const handlers = [
  randomOrgCoverageHandler,
  randomAccountDetailsHandler,
  randomUsersHandler,
  commitErrored,
]

import { randomAccountDetailsHandler } from 'services/account/mocks'
import { randomOrgCoverageHandler } from 'services/charts/mocks'
import { commitErrored } from 'services/commit/mocks'
import { randomFlagsHandler } from 'services/repo/mocks'
import { randomUsersHandler } from 'services/users/mocks'

export const handlers = [
  randomOrgCoverageHandler,
  randomAccountDetailsHandler,
  randomUsersHandler,
  commitErrored,
  randomFlagsHandler,
]

// import { rest } from 'msw'

import { randomOrgCoverageHandler } from 'services/charts/mocks'
import { randomAccountDetailsHandler } from 'services/account/mocks'
import { randomUsersHandler } from 'services/users/mocks'

export const handlers = [
  randomOrgCoverageHandler,
  randomAccountDetailsHandler,
  randomUsersHandler,
]

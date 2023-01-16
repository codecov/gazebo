import { randomAccountDetailsHandler } from 'services/account/mocks'
import { repoCoverageHandler } from 'services/charts/mocks'
import { commitErrored } from 'services/commit/mocks'
import {
  backfillFlagMembershipsHandler,
  flagMeasurementsHandler,
  flagsSelectHandler,
} from 'services/repo/mocks'
import { randomUsersHandler } from 'services/users/mocks'

export const handlers = [
  repoCoverageHandler,
  randomAccountDetailsHandler,
  randomUsersHandler,
  commitErrored,
  flagsSelectHandler,
  flagMeasurementsHandler,
  backfillFlagMembershipsHandler,
]

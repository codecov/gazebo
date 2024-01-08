import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import A from 'ui/A'

const BundleComparisonSchema = z.object({
  name: z.string(),
  changeType: z.string(),
  sizeDelta: z.number(),
  sizeTotal: z.number(),
  loadTimeDelta: z.number(),
  loadTimeTotal: z.number(),
})

export function useCommitBundleList() {}
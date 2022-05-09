import { useQuery, UseQueryOptions } from 'react-query'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch('http://localhost:8000/graphql/gh', {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    })

    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0]

      throw new Error(message)
    }

    return json.data
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  DateTime: any
}

export type Branch = {
  __typename?: 'Branch'
  head: Commit
  name: Scalars['String']
}

export type BranchConnection = {
  __typename?: 'BranchConnection'
  edges: Array<Maybe<BranchEdge>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type BranchEdge = {
  __typename?: 'BranchEdge'
  cursor: Scalars['String']
  node: Branch
}

export type Commit = {
  __typename?: 'Commit'
  author?: Maybe<Owner>
  branchName?: Maybe<Scalars['String']>
  ciPassed?: Maybe<Scalars['Boolean']>
  commitid?: Maybe<Scalars['String']>
  compareWithParent?: Maybe<Comparison>
  coverageFile?: Maybe<File>
  createdAt?: Maybe<Scalars['DateTime']>
  flagNames?: Maybe<Array<Maybe<Scalars['String']>>>
  message?: Maybe<Scalars['String']>
  parent?: Maybe<Commit>
  pullId?: Maybe<Scalars['Int']>
  state?: Maybe<Scalars['String']>
  totals?: Maybe<CoverageTotals>
  uploads?: Maybe<UploadConnection>
  yaml?: Maybe<Scalars['String']>
}

export type CommitCoverageFileArgs = {
  flags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  path: Scalars['String']
}

export type CommitUploadsArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type CommitConnection = {
  __typename?: 'CommitConnection'
  edges: Array<Maybe<CommitEdge>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type CommitEdge = {
  __typename?: 'CommitEdge'
  cursor: Scalars['String']
  node: Commit
}

export type CommitsSetFilters = {
  branchName?: InputMaybe<Scalars['String']>
  hideFailedCI?: InputMaybe<Scalars['Boolean']>
}

export type Comparison = {
  __typename?: 'Comparison'
  changeWithParent?: Maybe<Scalars['Float']>
  error?: Maybe<ComparisonError>
  impactedFiles: Array<Maybe<ImpactedFile>>
  patchTotals?: Maybe<CoverageTotals>
  state: Scalars['String']
}

export enum ComparisonError {
  MissingBaseReport = 'MISSING_BASE_REPORT',
  MissingHeadReport = 'MISSING_HEAD_REPORT',
}

export type CoverageAnnotation = {
  __typename?: 'CoverageAnnotation'
  coverage?: Maybe<CoverageLine>
  line?: Maybe<Scalars['Int']>
}

/** Possible value for the coverage of a line, using single letter for a more compact response */
export enum CoverageLine {
  H = 'H',
  M = 'M',
  P = 'P',
}

export type CoverageTotals = {
  __typename?: 'CoverageTotals'
  coverage?: Maybe<Scalars['Float']>
  fileCount?: Maybe<Scalars['Int']>
  hitsCount?: Maybe<Scalars['Int']>
  lineCount?: Maybe<Scalars['Int']>
  missesCount?: Maybe<Scalars['Int']>
  partialsCount?: Maybe<Scalars['Int']>
}

export type CreateApiTokenError = UnauthenticatedError | ValidationError

export type CreateApiTokenInput = {
  name: Scalars['String']
}

export type CreateApiTokenPayload = {
  __typename?: 'CreateApiTokenPayload'
  error?: Maybe<CreateApiTokenError>
  fullToken?: Maybe<Scalars['String']>
  session?: Maybe<Session>
}

export type DeleteSessionError = UnauthenticatedError

export type DeleteSessionInput = {
  sessionid: Scalars['Int']
}

export type DeleteSessionPayload = {
  __typename?: 'DeleteSessionPayload'
  error?: Maybe<DeleteSessionError>
}

export type File = {
  __typename?: 'File'
  content?: Maybe<Scalars['String']>
  coverage?: Maybe<Array<Maybe<CoverageAnnotation>>>
  totals?: Maybe<CoverageTotals>
}

export enum GoalOnboarding {
  ImproveCoverage = 'IMPROVE_COVERAGE',
  MaintainCoverage = 'MAINTAIN_COVERAGE',
  Other = 'OTHER',
  StartingWithTests = 'STARTING_WITH_TESTS',
  TeamRequirements = 'TEAM_REQUIREMENTS',
}

export type ImpactedFile = {
  __typename?: 'ImpactedFile'
  baseCoverage?: Maybe<CoverageTotals>
  baseName?: Maybe<Scalars['String']>
  headCoverage?: Maybe<CoverageTotals>
  headName?: Maybe<Scalars['String']>
  patchCoverage?: Maybe<CoverageTotals>
}

export type Me = {
  __typename?: 'Me'
  businessEmail?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  isSyncingWithGitProvider: Scalars['Boolean']
  myOrganizations: MyOrganizationConnection
  onboardingCompleted: Scalars['Boolean']
  owner: Owner
  privateAccess?: Maybe<Scalars['Boolean']>
  sessions: SessionConnection
  trackingMetadata: TrackingMetadata
  user: User
  viewableRepositories: ViewableRepositoryConnection
}

export type MeMyOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  filters?: InputMaybe<OrganizationSetFilters>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type MeSessionsArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type MeViewableRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  filters?: InputMaybe<RepositorySetFilters>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
  ordering?: InputMaybe<RepositoryOrdering>
  orderingDirection?: InputMaybe<OrderingDirection>
}

export type Mutation = {
  __typename?: 'Mutation'
  createApiToken?: Maybe<CreateApiTokenPayload>
  deleteSession?: Maybe<DeleteSessionPayload>
  onboardUser?: Maybe<OnboardUserPayload>
  setYamlOnOwner?: Maybe<SetYamlOnOwnerPayload>
  syncWithGitProvider?: Maybe<SyncWithGitProviderPayload>
  updateProfile?: Maybe<UpdateProfilePayload>
}

export type MutationCreateApiTokenArgs = {
  input: CreateApiTokenInput
}

export type MutationDeleteSessionArgs = {
  input: DeleteSessionInput
}

export type MutationOnboardUserArgs = {
  input: OnboardUserInput
}

export type MutationSetYamlOnOwnerArgs = {
  input: SetYamlOnOwnerInput
}

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput
}

export type MyOrganizationConnection = {
  __typename?: 'MyOrganizationConnection'
  edges?: Maybe<Array<Maybe<MyOrganizationConnectionEdge>>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type MyOrganizationConnectionEdge = {
  __typename?: 'MyOrganizationConnectionEdge'
  cursor: Scalars['String']
  node?: Maybe<Owner>
}

export type NotFoundError = {
  __typename?: 'NotFoundError'
  message: Scalars['String']
}

export type OnboardUserError =
  | UnauthenticatedError
  | UnauthorizedError
  | ValidationError

export type OnboardUserInput = {
  businessEmail?: InputMaybe<Scalars['String']>
  email?: InputMaybe<Scalars['String']>
  goals: Array<InputMaybe<GoalOnboarding>>
  otherGoal?: InputMaybe<Scalars['String']>
  typeProjects: Array<InputMaybe<TypeProjectOnboarding>>
}

export type OnboardUserPayload = {
  __typename?: 'OnboardUserPayload'
  error?: Maybe<OnboardUserError>
  me?: Maybe<Me>
}

export enum OrderingDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type OrganizationSetFilters = {
  term?: InputMaybe<Scalars['String']>
}

export type Owner = {
  __typename?: 'Owner'
  avatarUrl?: Maybe<Scalars['String']>
  isAdmin: Scalars['Boolean']
  isCurrentUserPartOfOrg: Scalars['Boolean']
  numberOfUploads?: Maybe<Scalars['Int']>
  repositories: RepositoryConnection
  repository?: Maybe<Repository>
  username?: Maybe<Scalars['String']>
  yaml?: Maybe<Scalars['String']>
}

export type OwnerRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  filters?: InputMaybe<RepositorySetFilters>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
  ordering?: InputMaybe<RepositoryOrdering>
  orderingDirection?: InputMaybe<OrderingDirection>
}

export type OwnerRepositoryArgs = {
  name: Scalars['String']
}

export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor?: Maybe<Scalars['String']>
  hasNextPage: Scalars['Boolean']
  hasPreviousPage: Scalars['Boolean']
  startCursor?: Maybe<Scalars['String']>
}

export type Profile = {
  __typename?: 'Profile'
  createdAt: Scalars['DateTime']
  goals: Array<Maybe<GoalOnboarding>>
  otherGoal?: Maybe<Scalars['String']>
  typeProjects: Array<Maybe<TypeProjectOnboarding>>
}

export type Pull = {
  __typename?: 'Pull'
  author?: Maybe<Owner>
  commits?: Maybe<CommitConnection>
  compareWithBase?: Maybe<Comparison>
  comparedTo?: Maybe<Commit>
  head?: Maybe<Commit>
  pullId?: Maybe<Scalars['Int']>
  state?: Maybe<PullRequestState>
  title?: Maybe<Scalars['String']>
  updatestamp?: Maybe<Scalars['DateTime']>
}

export type PullCommitsArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type PullConnection = {
  __typename?: 'PullConnection'
  edges: Array<Maybe<PullEdge>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type PullEdge = {
  __typename?: 'PullEdge'
  cursor: Scalars['String']
  node: Pull
}

/** Possible value for the state of a pull request */
export enum PullRequestState {
  Closed = 'CLOSED',
  Merged = 'MERGED',
  Open = 'OPEN',
}

export type PullsSetFilters = {
  state?: InputMaybe<Array<InputMaybe<PullRequestState>>>
}

export type Query = {
  __typename?: 'Query'
  me?: Maybe<Me>
  owner?: Maybe<Owner>
}

export type QueryOwnerArgs = {
  username: Scalars['String']
}

export type Repository = {
  __typename?: 'Repository'
  active: Scalars['Boolean']
  author: Owner
  branch?: Maybe<Branch>
  branches?: Maybe<BranchConnection>
  commit?: Maybe<Commit>
  commits?: Maybe<CommitConnection>
  coverage?: Maybe<Scalars['Float']>
  defaultBranch?: Maybe<Scalars['String']>
  latestCommitAt?: Maybe<Scalars['DateTime']>
  name: Scalars['String']
  private: Scalars['Boolean']
  pull?: Maybe<Pull>
  pulls?: Maybe<PullConnection>
  updatedAt?: Maybe<Scalars['DateTime']>
  uploadToken?: Maybe<Scalars['String']>
}

export type RepositoryBranchArgs = {
  name?: InputMaybe<Scalars['String']>
}

export type RepositoryBranchesArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type RepositoryCommitArgs = {
  id: Scalars['String']
}

export type RepositoryCommitsArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  filters?: InputMaybe<CommitsSetFilters>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type RepositoryPullArgs = {
  id: Scalars['Int']
}

export type RepositoryPullsArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  filters?: InputMaybe<PullsSetFilters>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
  orderingDirection?: InputMaybe<OrderingDirection>
}

export type RepositoryConnection = {
  __typename?: 'RepositoryConnection'
  edges?: Maybe<Array<Maybe<RepositoryConnectionEdge>>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type RepositoryConnectionEdge = {
  __typename?: 'RepositoryConnectionEdge'
  cursor: Scalars['String']
  node?: Maybe<Repository>
}

export enum RepositoryOrdering {
  CommitDate = 'COMMIT_DATE',
  Coverage = 'COVERAGE',
  Id = 'ID',
  Name = 'NAME',
}

export type RepositorySetFilters = {
  active?: InputMaybe<Scalars['Boolean']>
  repoNames?: InputMaybe<Array<InputMaybe<Scalars['String']>>>
  term?: InputMaybe<Scalars['String']>
}

export type Session = {
  __typename?: 'Session'
  ip?: Maybe<Scalars['String']>
  lastFour?: Maybe<Scalars['String']>
  lastseen?: Maybe<Scalars['DateTime']>
  name?: Maybe<Scalars['String']>
  sessionid?: Maybe<Scalars['Int']>
  type: Scalars['String']
  useragent?: Maybe<Scalars['String']>
}

export type SessionConnection = {
  __typename?: 'SessionConnection'
  edges?: Maybe<Array<Maybe<SessionConnectionEdge>>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type SessionConnectionEdge = {
  __typename?: 'SessionConnectionEdge'
  cursor: Scalars['String']
  node?: Maybe<Session>
}

export type SetYamlOnOwnerError =
  | NotFoundError
  | UnauthenticatedError
  | UnauthorizedError
  | ValidationError

export type SetYamlOnOwnerInput = {
  username: Scalars['String']
  yaml: Scalars['String']
}

export type SetYamlOnOwnerPayload = {
  __typename?: 'SetYamlOnOwnerPayload'
  error?: Maybe<SetYamlOnOwnerError>
  owner?: Maybe<Owner>
}

export type SyncWithGitProviderError = UnauthenticatedError

export type SyncWithGitProviderPayload = {
  __typename?: 'SyncWithGitProviderPayload'
  error?: Maybe<SyncWithGitProviderError>
  me?: Maybe<Me>
}

export enum TypeProjectOnboarding {
  Educational = 'EDUCATIONAL',
  OpenSource = 'OPEN_SOURCE',
  Personal = 'PERSONAL',
  YourOrg = 'YOUR_ORG',
}

export type UnauthenticatedError = {
  __typename?: 'UnauthenticatedError'
  message: Scalars['String']
}

export type UnauthorizedError = {
  __typename?: 'UnauthorizedError'
  message: Scalars['String']
}

export type UpdateProfileError = UnauthenticatedError | ValidationError

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']>
  name?: InputMaybe<Scalars['String']>
}

export type UpdateProfilePayload = {
  __typename?: 'UpdateProfilePayload'
  error?: Maybe<CreateApiTokenError>
  me?: Maybe<Me>
}

export type Upload = {
  __typename?: 'Upload'
  buildCode?: Maybe<Scalars['String']>
  ciUrl?: Maybe<Scalars['String']>
  createdAt: Scalars['DateTime']
  downloadUrl?: Maybe<Scalars['String']>
  errors?: Maybe<UploadErrorsConnection>
  flags?: Maybe<Array<Maybe<Scalars['String']>>>
  jobCode?: Maybe<Scalars['String']>
  provider?: Maybe<Scalars['String']>
  state: UploadState
  updatedAt: Scalars['DateTime']
  uploadType?: Maybe<UploadType>
}

export type UploadConnection = {
  __typename?: 'UploadConnection'
  edges: Array<Maybe<UploadEdge>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type UploadEdge = {
  __typename?: 'UploadEdge'
  cursor: Scalars['String']
  node: Upload
}

export type UploadError = {
  __typename?: 'UploadError'
  errorCode?: Maybe<UploadErrorEnum>
}

export enum UploadErrorEnum {
  FileNotInStorage = 'FILE_NOT_IN_STORAGE',
  ReportEmpty = 'REPORT_EMPTY',
  ReportExpired = 'REPORT_EXPIRED',
}

export type UploadErrorsConnection = {
  __typename?: 'UploadErrorsConnection'
  edges: Array<Maybe<UploadErrorsEdge>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type UploadErrorsEdge = {
  __typename?: 'UploadErrorsEdge'
  cursor: Scalars['String']
  node: UploadError
}

export enum UploadState {
  Complete = 'COMPLETE',
  Error = 'ERROR',
  Processed = 'PROCESSED',
  Uploaded = 'UPLOADED',
}

export enum UploadType {
  Carriedforward = 'CARRIEDFORWARD',
  Uploaded = 'UPLOADED',
}

export type User = {
  __typename?: 'User'
  avatarUrl?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  student: Scalars['Boolean']
  studentCreatedAt?: Maybe<Scalars['DateTime']>
  studentUpdatedAt?: Maybe<Scalars['DateTime']>
  username: Scalars['String']
}

export type ValidationError = {
  __typename?: 'ValidationError'
  message: Scalars['String']
}

export type ViewableRepositoryConnection = {
  __typename?: 'ViewableRepositoryConnection'
  edges?: Maybe<Array<Maybe<ViewableRepositoryConnectionEdge>>>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type ViewableRepositoryConnectionEdge = {
  __typename?: 'ViewableRepositoryConnectionEdge'
  cursor: Scalars['String']
  node?: Maybe<Repository>
}

export type TrackingMetadata = {
  __typename?: 'trackingMetadata'
  bot?: Maybe<Scalars['String']>
  createstamp?: Maybe<Scalars['DateTime']>
  delinquent?: Maybe<Scalars['Boolean']>
  didTrial?: Maybe<Scalars['Boolean']>
  hasYaml: Scalars['Boolean']
  ownerid: Scalars['Int']
  plan?: Maybe<Scalars['String']>
  planProvider?: Maybe<Scalars['String']>
  planUserCount?: Maybe<Scalars['Int']>
  profile?: Maybe<Profile>
  service: Scalars['String']
  serviceId: Scalars['String']
  staff?: Maybe<Scalars['Boolean']>
  updatestamp?: Maybe<Scalars['DateTime']>
}

export type PullQueryVariables = Exact<{
  owner: Scalars['String']
  repo: Scalars['String']
  pullId: Scalars['Int']
}>

export type PullQuery = {
  __typename?: 'Query'
  owner?: {
    __typename?: 'Owner'
    repository?: {
      __typename?: 'Repository'
      pull?: {
        __typename?: 'Pull'
        pullId?: number | null
        title?: string | null
        state?: PullRequestState | null
        updatestamp?: any | null
        author?: { __typename?: 'Owner'; username?: string | null } | null
        head?: {
          __typename?: 'Commit'
          commitid?: string | null
          totals?: {
            __typename?: 'CoverageTotals'
            coverage?: number | null
          } | null
        } | null
        comparedTo?: { __typename?: 'Commit'; commitid?: string | null } | null
        compareWithBase?: {
          __typename?: 'Comparison'
          changeWithParent?: number | null
          patchTotals?: {
            __typename?: 'CoverageTotals'
            coverage?: number | null
          } | null
        } | null
        commits?: {
          __typename?: 'CommitConnection'
          totalCount: number
          pageInfo: {
            __typename?: 'PageInfo'
            hasNextPage: boolean
            startCursor?: string | null
            hasPreviousPage: boolean
          }
          edges: Array<{
            __typename?: 'CommitEdge'
            node: {
              __typename?: 'Commit'
              commitid?: string | null
              message?: string | null
              createdAt?: any | null
              author?: { __typename?: 'Owner'; username?: string | null } | null
            }
          } | null>
        } | null
      } | null
    } | null
  } | null
}

export const PullDocument = `
    query Pull($owner: String!, $repo: String!, $pullId: Int!) {
  owner(username: $owner) {
    repository(name: $repo) {
      pull(id: $pullId) {
        pullId
        title
        state
        author {
          username
        }
        updatestamp
        head {
          commitid
          totals {
            coverage
          }
        }
        comparedTo {
          commitid
        }
        compareWithBase {
          patchTotals {
            coverage
          }
          changeWithParent
        }
        commits {
          totalCount
          pageInfo {
            hasNextPage
            startCursor
            hasPreviousPage
          }
          edges {
            node {
              commitid
              message
              createdAt
              author {
                username
              }
            }
          }
        }
      }
    }
  }
}
    `
export const usePullQuery = <TData = PullQuery, TError = unknown>(
  variables: PullQueryVariables,
  options?: UseQueryOptions<PullQuery, TError, TData>
) =>
  useQuery<PullQuery, TError, TData>(
    ['Pull', variables],
    fetcher<PullQuery, PullQueryVariables>(PullDocument, variables),
    options
  )

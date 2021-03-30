import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import { useUser } from 'services/user'

// Set default values so fields are readable by Salesforce
function getUserData(
  ownerid,
  avatarUrl,
  serviceId,
  plan,
  staff,
  yaml,
  email = 'unknown@codecov.io',
  name = 'unknown',
  username = 'unknown',
  student = false,
  bot = false,
  delinquent = false,
  didTrial = false,
  privateAccess = false,
  planProvider = '',
  planUserCount = 5,
  createstamp = new Date('2014-01-01 12:00:00').toISOString(),
  updatestamp = new Date('2014-01-01 12:00:00').toISOString(),
  studentCreatedAt = new Date('2014-01-01 12:00:00').toISOString(),
  studentUpdatedAt = new Date('2014-01-01 12:00:00').toISOString()
) {
  return {
    ownerid,
    avatar: avatarUrl,
    service_id: serviceId,
    plan,
    staff,
    has_yaml: Boolean(yaml),
    guest: false,
    email,
    name,
    username,
    student,
    bot,
    delinquent,
    did_trial: didTrial,
    private_access: privateAccess,
    plan_provider: planProvider,
    plan_user_count: planUserCount,
    createdAt: createstamp,
    updatedAt: updatestamp,
    student_created_at: studentCreatedAt,
    student_updated_at: studentUpdatedAt,
  }
}

function setDataLayer(user) {
  const user_without_nulls = omitBy(user, isNull)
  const user_data = user
    ? getUserData(
        user_without_nulls.ownerid,
        user_without_nulls.avatarUrl,
        user_without_nulls.serviceId,
        user_without_nulls.plan,
        user_without_nulls.staff,
        user_without_nulls.yaml,
        user_without_nulls.email,
        user_without_nulls.name,
        user_without_nulls.username,
        user_without_nulls.student,
        user_without_nulls.bot,
        user_without_nulls.delinquent,
        user_without_nulls.didTrial,
        user_without_nulls.privateAccess,
        user_without_nulls.planProvider,
        user_without_nulls.planUserCount,
        user_without_nulls.createstamp,
        user_without_nulls.updatestamp,
        user_without_nulls.studentCreatedAt,
        user_without_nulls.studentUpdatedAt
      )
    : { guest: true }
  const layer = {
    codecov: {
      app: {
        version: 'react-app',
      },
      user: user_data,
    },
  }
  window.dataLayer = [layer]
}

export function useTracking() {
  return useUser({
    onSuccess: (user) => setDataLayer(user),
    onError: (data) => setDataLayer(null),
    suspense: false,
  })
}

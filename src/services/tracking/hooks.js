import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import { useEffect } from 'react'
import { useLDClient } from 'launchdarkly-react-client-sdk'

import { useUser } from 'services/user'

// Set default values so fields are readable by Salesforce
function getUserData(
  ownerid,
  avatarUrl,
  serviceId,
  plan,
  staff,
  yaml,
  service,
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
    /* eslint-disable camelcase */
    ownerid,
    avatar: avatarUrl,
    service_id: serviceId,
    plan,
    staff,
    has_yaml: Boolean(yaml),
    service,
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
    /* eslint-enable camelcase */
  }
}

function setDataLayer(user) {
  const userWithoutNulls = omitBy(user, isNull)
  const userData = user
    ? getUserData(
        userWithoutNulls.ownerid,
        userWithoutNulls.avatarUrl,
        userWithoutNulls.serviceId,
        userWithoutNulls.plan,
        userWithoutNulls.staff,
        userWithoutNulls.yaml,
        userWithoutNulls.service,
        userWithoutNulls.email,
        userWithoutNulls.name,
        userWithoutNulls.username,
        userWithoutNulls.student,
        userWithoutNulls.bot,
        userWithoutNulls.delinquent,
        userWithoutNulls.didTrial,
        userWithoutNulls.privateAccess,
        userWithoutNulls.planProvider,
        userWithoutNulls.planUserCount,
        userWithoutNulls.createstamp,
        userWithoutNulls.updatestamp,
        userWithoutNulls.studentCreatedAt,
        userWithoutNulls.studentUpdatedAt
      )
    : { guest: true }
  const layer = {
    codecov: {
      app: {
        version: 'react-app',
      },
      user: userData,
    },
  }
  window.dataLayer = [layer]
}

export function useTracking() {
  const ldClient = useLDClient()
  const { data: user } = useUser({
    onSuccess: (user) => {
      setDataLayer(user)
    },
    onError: () => setDataLayer(null),
    suspense: false,
  })

  // Register LaunchDarkly user
  useEffect(() => {
    if (user?.ownerid) {
      ldClient?.identify({
        name: user?.name,
        email: user?.email,
        key: user.ownerid,
        custom: user,
      })
    }
  }, [user, ldClient])
}

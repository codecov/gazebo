import { useUser } from 'services/user'

/* eslint-disable */
function setDataLayer(user) {
  const user_data = user
    ? {
        ownerid: user.ownerid,
        avatar: user.avatarUrl,
        service_id: user.serviceId,
        plan: user.plan,
        staff: user.staff,
        has_yaml: Boolean(user.yaml),
        guest: false,
        // Set default values so fields can be parsed by Salesforce
        email: user.email || 'unknown@codecov.io',
        name: user.name || 'unknown',
        username: user.username || 'unknown',
        student: user.student || false,
        bot: user.bot || false,
        delinquent: user.delinquent || false,
        did_trial: user.didTrial || false,
        private_access: user.privateAccess || false,
        plan_provider: user.planProvider || '',
        plan_user_count:
          (typeof user.planUserCount == 'number' && user.planUserCount) || 5,
        createdAt:
          user.createstamp || new Date('2014-01-01 12:00:00').toISOString(),
        updatedAt:
          user.updatestamp || new Date('2014-01-01 12:00:00').toISOString(),
        student_created_at:
          user.studentCreatedAt ||
          new Date('2014-01-01 12:00:00').toISOString(),
        student_updated_at:
          user.studentUpdatedAt ||
          new Date('2014-01-01 12:00:00').toISOString(),
      }
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
/*eslint-enable*/
export function useTracking() {
  return useUser({
    onSuccess: (user) => setDataLayer(user),
    onError: (data) => setDataLayer(null),
    suspense: false,
  })
}

import { useHistory, useParams } from 'react-router-dom'

import { useUpgradePlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

// This is a hook that should be used by all types of controls, as it acts as the
// layer that communicates with the backend
export const useUpgradeControls = () => {
  const { provider, owner } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()
  const { mutate } = useUpgradePlan({ provider, owner })

  function upgradePlan({ seats, newPlan }) {
    return mutate(
      {
        seats,
        newPlan,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            text: 'Plan successfully upgraded',
          })
          history.push(`/plan/${provider}/${owner}`)
        },
        onError: (error) => {
          addToast({
            type: 'error',
            text: error?.data?.detail || 'Something went wrong',
          })
        },
      }
    )
  }

  return {
    // perYearPrice,
    // perMonthPrice,
    // register,
    // handleSubmit,
    // // isPerYear,
    // // formState,
    // setValue,
    // getValues,
    // // reset,
    // watch,
    upgradePlan,
    // ...rest,
  }

  //   const {
  //     register,
  //     handleSubmit,
  //     watch,
  //     formState,
  //     setValue,
  //     getValues,
  //     reset,
  //   } = useForm({
  //     defaultValues: getInitialDataForm({
  //       accountDetails,
  //       proPlanYear,
  //       // isSentryUpgrade,
  //       // sentryPlanYear,
  //       // trialStatus: planData?.plan?.trialStatus,
  //     }),
  //     resolver: zodResolver(
  //       getSchema({
  //         accountDetails,
  //         minSeats: MIN_NB_SEATS_PRO,
  //         // trialStatus: planData?.plan?.trialStatus,
  //       })
  //     ),
  //     mode: 'onChange',
  //   })

  // const perYearPrice = calculatePrice({
  //   seats: watch('seats'),
  //   baseUnitPrice: proPlanYear?.baseUnitPrice,
  //   // baseUnitPrice: isSentryUpgrade
  //   //   ? sentryPlanYear?.baseUnitPrice
  //   //   : proPlanYear?.baseUnitPrice,

  //   // isSentryUpgrade,
  //   // sentryPrice,
  // })

  // const perMonthPrice = calculatePrice({
  //   seats: watch('seats'),
  //   baseUnitPrice: proPlanMonth?.baseUnitPrice,
  //   // baseUnitPrice: isSentryUpgrade
  //   //   ? sentryPlanYear?.baseUnitPrice
  //   //   : proPlanMonth?.baseUnitPrice,

  //   // isSentryUpgrade,
  //   // sentryPrice,
  // })
}

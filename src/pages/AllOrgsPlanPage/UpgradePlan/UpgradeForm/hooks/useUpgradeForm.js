import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import { useUpgradePlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { isAnnualPlan } from 'shared/utils/billing'
import { getInitialDataForm, getSchema } from 'shared/utils/upgradeForm'

const calculatePrice = ({
  seats,
  baseUnitPrice,
  isSentryUpgrade,
  sentryPrice,
}) => {
  let price = Math.floor(seats) * baseUnitPrice

  if (isSentryUpgrade) {
    price = sentryPrice
    if (seats > 5) {
      price += Math.floor(seats - 5) * baseUnitPrice
    }
  }

  return price
}

export const useUpgradeForm = ({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  minSeats,
  sentryPrice,
  sentryPlanYear,
  sentryPlanMonth,
  isSentryUpgrade,
  organizationName,
}) => {
  const { provider } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()

  const { mutate, ...rest } = useUpgradePlan({
    provider,
    owner: organizationName,
  })

  const upgradePlan = ({ seats, newPlan }) =>
    mutate(
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
          history.push(`/plan/${provider}/${organizationName}`)
        },
        onError: (error) => {
          addToast({
            type: 'error',
            text: error?.data?.detail || 'Something went wrong',
          })
        },
      }
    )

  const {
    register,
    handleSubmit,
    watch,
    formState,
    setValue,
    getValues,
    reset,
  } = useForm({
    defaultValues: getInitialDataForm({
      accountDetails,
      proPlanYear,
      isSentryUpgrade,
      minSeats,
      sentryPlanYear,
    }),
    resolver: zodResolver(getSchema({ accountDetails, minSeats })),
    mode: 'onChange',
  })

  const perYearPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: isSentryUpgrade
      ? sentryPlanYear?.baseUnitPrice
      : proPlanYear?.baseUnitPrice,
    isSentryUpgrade,
    sentryPrice,
  })

  const perMonthPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: isSentryUpgrade
      ? sentryPlanMonth?.baseUnitPrice
      : proPlanMonth?.baseUnitPrice,
    isSentryUpgrade,
    sentryPrice,
  })

  const isPerYear = isAnnualPlan(watch('newPlan'))

  return {
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    formState,
    setValue,
    getValues,
    reset,
    upgradePlan,
    ...rest,
  }
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import {
  useAccountDetails,
  useAvailablePlans,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { isAnnualPlan, useProPlans } from 'shared/utils/billing'
import {
  calculatePrice,
  getInitialDataForm,
  getSchema,
  MIN_NB_SEATS,
} from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingControls from './BillingControls'
import TotalBanner from './TotalBanner'
import UserCount from './UserCount'

import UpdateButton from '../UpdateButton'

const useProPlanControls = ({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  minSeats,
  // sentryPrice,
  // sentryPlanYear,
  // sentryPlanMonth,
  // isSentryUpgrade,
}) => {
  const { provider, owner } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpgradePlan({ provider, owner })

  // Put this into it's own file
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
      // isSentryUpgrade,
      // sentryPlanYear,
      // trialStatus: planData?.plan?.trialStatus,
    }),
    resolver: zodResolver(
      getSchema({
        accountDetails,
        minSeats,
        // trialStatus: planData?.plan?.trialStatus,
      })
    ),
    mode: 'onChange',
  })

  const perYearPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: proPlanYear?.baseUnitPrice,
    // baseUnitPrice: isSentryUpgrade
    //   ? sentryPlanYear?.baseUnitPrice
    //   : proPlanYear?.baseUnitPrice,

    // isSentryUpgrade,
    // sentryPrice,
  })

  const perMonthPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: proPlanMonth?.baseUnitPrice,
    // baseUnitPrice: isSentryUpgrade
    //   ? sentryPlanYear?.baseUnitPrice
    //   : proPlanMonth?.baseUnitPrice,

    // isSentryUpgrade,
    // sentryPrice,
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
    watch,
    upgradePlan,
    ...rest,
  }
}

function ProPlanControls() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })

  // const isSentryUpgrade = canApplySentryUpgrade({
  //   plan: accountDetails?.plan?.value,
  //   plans,
  // })
  // const minSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS
  const minSeats = MIN_NB_SEATS
  // const trialStatus = planData?.plan?.trialStatus

  const {
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    setValue,
    getValues,
    formState: { isValid, errors },
    upgradePlan,
    watch,
  } = useProPlanControls({
    proPlanYear,
    proPlanMonth,
    accountDetails,
    minSeats,
    // sentryPrice: SENTRY_PRICE,
    // sentryPlanYear,
    // sentryPlanMonth,
    // isSentryUpgrade,
  })

  const planString = getValues('newPlan')
  // const isPerYear = isAnnualPlan(watch('newPlan'))

  return (
    <form
      className="flex flex-col gap-4 border p-4 text-ds-gray-nonary md:w-2/3"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>
      <div className="flex flex-col gap-2">
        <BillingControls
          planString={planString}
          // isSentryUpgrade={isSentryUpgrade}
          setValue={setValue}
        />
      </div>
      <div className="flex flex-col gap-2 xl:w-5/12">
        <div className="w-2/6">
          <TextInput
            data-cy="seats"
            dataMarketing="plan-pricing-seats"
            {...register('seats')}
            id="nb-seats"
            size="20"
            type="number"
            label="Seat count"
            min={minSeats}
          />
        </div>
        <UserCount />
        {/* <UserCount
          activatedStudentCount={accountDetails?.activatedStudentCount}
          activatedUserCount={accountDetails?.activatedUserCount}
          inactiveUserCount={accountDetails?.inactiveUserCount}
          isSentryUpgrade={isSentryUpgrade}
        /> */}
      </div>
      <TotalBanner
        isPerYear={isPerYear}
        perYearPrice={perYearPrice}
        perMonthPrice={perMonthPrice}
        setValue={setValue}
        // isSentryUpgrade={isSentryUpgrade}
        // sentryPlanYear={sentryPlanYear}
        // sentryPlanMonth={sentryPlanMonth}
        seats={watch('seats')}
      />
      {/* The next invoice logic has not been working for a long time, I'm wondering if we should just get rid of it. There should be a screenshot I
      attached showing how it should look, mega showing how much we haven't properly used this. Deleting for now */}
      {errors?.seats && (
        <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
          {errors?.seats?.message}
        </p>
      )}
      <div className="w-fit">
        {/* This will likely stay the way it is, just moved it to a shared place */}
        <UpdateButton
          isValid={isValid}
          getValues={getValues}
          value={accountDetails?.plan?.value}
          quantity={accountDetails?.plan?.quantity}
        />
      </div>
    </form>
  )
}

export default ProPlanControls

import { zodResolver } from '@hookform/resolvers/zod'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import {
  accountDetailsPropType,
  planPropType,
  useAvailablePlans,
  usePlanData,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { useFlags } from 'shared/featureFlags'
import {
  canApplySentryUpgrade,
  findTeamPlans,
  getNextBillingDate,
  isAnnualPlan,
  isTeamPlan,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import {
  calculatePrice,
  getInitialDataForm,
  getSchema,
  MIN_NB_SEATS,
  MIN_SENTRY_SEATS,
  SENTRY_PRICE,
} from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingControls from './BillingControls/BillingControls'
import TotalBanner from './TotalBanner'
import UpdateButton from './UpdateButton'
import UserCount from './UserCount'

import PlanDetailsControls from '../PlanDetailsControls'

const useUpgradeForm = ({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  minSeats,
  sentryPrice,
  sentryPlanYear,
  sentryPlanMonth,
  isSentryUpgrade,
  teamPlanMonth,
  teamPlanYear,
  selectedPlan,
}) => {
  const { provider, owner } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpgradePlan({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })

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
      isSentryUpgrade,
      sentryPlanYear,
      trialStatus: planData?.plan?.trialStatus,
    }),
    resolver: zodResolver(
      getSchema({
        accountDetails,
        minSeats,
        trialStatus: planData?.plan?.trialStatus,
        selectedPlan,
      })
    ),
    mode: 'onChange',
  })

  const planString = getValues('newPlan')
  const isSelectedPlanTeam = isTeamPlan(planString)

  const yearBaseUnitPrice = isSelectedPlanTeam
    ? teamPlanYear?.baseUnitPrice
    : isSentryUpgrade
    ? sentryPlanYear?.baseUnitPrice
    : proPlanYear?.baseUnitPrice

  const monthBaseUnitPrice = isSelectedPlanTeam
    ? teamPlanMonth?.baseUnitPrice
    : isSentryUpgrade
    ? sentryPlanMonth?.baseUnitPrice
    : proPlanMonth?.baseUnitPrice

  const perYearPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: yearBaseUnitPrice,
    isSentryUpgrade,
    sentryPrice,
    isSelectedPlanTeam,
  })

  const perMonthPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: monthBaseUnitPrice,
    isSentryUpgrade,
    sentryPrice,
    isSelectedPlanTeam,
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

const PlanDetails = ({
  isSentryUpgrade,
  hasTeamPlans,
  setSelectedPlan,
  setValue,
  multipleTiers,
}) => {
  if (hasTeamPlans && multipleTiers) {
    return (
      <PlanDetailsControls
        setValue={setValue}
        setSelectedPlan={setSelectedPlan}
        isSentryUpgrade={isSentryUpgrade}
      />
    )
  } else if (isSentryUpgrade) {
    return (
      <div>
        <h3 className="font-semibold">Plan</h3>
        <p>$29 monthly includes 5 seats.</p>
      </div>
    )
  } else {
    return null
  }
}

PlanDetails.propTypes = {
  setSelectedPlan: PropTypes.func,
  setValue: PropTypes.func,
  isSentryUpgrade: PropTypes.bool,
  hasTeamPlans: PropTypes.bool,
  multipleTiers: PropTypes.bool,
}

function UpgradeForm({
  proPlanYear,
  proPlanMonth,
  sentryPlanYear,
  sentryPlanMonth,
  accountDetails,
  setSelectedPlan,
  selectedPlan,
}) {
  const { provider, owner } = useParams()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const nextBillingDate = getNextBillingDate(accountDetails)
  const isSentryUpgrade = canApplySentryUpgrade({
    plan: accountDetails?.plan?.value,
    plans,
  })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })
  const minSeats =
    isSentryUpgrade && !isTeamPlan(selectedPlan?.value)
      ? MIN_SENTRY_SEATS
      : MIN_NB_SEATS

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
  } = useUpgradeForm({
    proPlanYear,
    proPlanMonth,
    accountDetails,
    minSeats,
    sentryPrice: SENTRY_PRICE,
    sentryPlanYear,
    sentryPlanMonth,
    isSentryUpgrade,
    teamPlanMonth,
    teamPlanYear,
    selectedPlan,
  })

  const planString = getValues('newPlan')

  return (
    <form
      className="flex flex-col gap-4 border p-4 text-ds-gray-nonary md:w-2/3"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>
      <PlanDetails
        setValue={setValue}
        setSelectedPlan={setSelectedPlan}
        isSentryUpgrade={isSentryUpgrade}
        hasTeamPlans={hasTeamPlans}
        multipleTiers={multipleTiers}
      />
      <div className="flex flex-col gap-2">
        <BillingControls
          planString={planString}
          setValue={setValue}
          isSentryUpgrade={isSentryUpgrade}
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
        <UserCount
          activatedStudentCount={accountDetails?.activatedStudentCount}
          activatedUserCount={accountDetails?.activatedUserCount}
          inactiveUserCount={accountDetails?.inactiveUserCount}
          isSentryUpgrade={isSentryUpgrade}
          planString={planString}
        />
      </div>
      <TotalBanner
        planString={planString}
        isPerYear={isPerYear}
        perYearPrice={perYearPrice}
        perMonthPrice={perMonthPrice}
        setValue={setValue}
        isSentryUpgrade={isSentryUpgrade}
        sentryPlanYear={sentryPlanYear}
        sentryPlanMonth={sentryPlanMonth}
        seats={watch('seats')}
      />
      {nextBillingDate && (
        <p className="mt-1 flex">
          Next Billing Date
          <span className="ml-auto">{nextBillingDate}</span>
        </p>
      )}
      {errors?.seats && (
        <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
          {errors?.seats?.message}
        </p>
      )}
      <div className="w-fit">
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

UpgradeForm.propTypes = {
  proPlanYear: planPropType.isRequired,
  proPlanMonth: planPropType.isRequired,
  accountDetails: accountDetailsPropType,
  sentryPlanYear: planPropType,
  sentryPlanMonth: planPropType,
  setSelectedPlan: PropTypes.func,
  selectedPlan: planPropType,
}

export default UpgradeForm

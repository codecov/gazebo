import { yupResolver } from '@hookform/resolvers/yup'
import { format, fromUnixTime } from 'date-fns'
import PropType from 'prop-types'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import * as yup from 'yup'

import {
  accountDetailsPropType,
  planPropType,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import RadioInput from 'ui/RadioInput/RadioInput'
import TextInput from 'ui/TextInput'

const MIN_NB_SEATS = 6

function getInitialDataForm(planOptions, accountDetails) {
  const currentPlan = accountDetails.plan
  const proPlan = planOptions?.find((plan) => plan.value === currentPlan?.value)

  const currentNbSeats = accountDetails.plan?.quantity ?? MIN_NB_SEATS

  return {
    // if the current plan is a proplan, we return it, otherwise select by default the first pro plan
    newPlan: proPlan ? proPlan.value : planOptions[0].value,
    // get the number of seats of the current plan, but minimum 6 seats
    seats: Math.max(currentNbSeats, MIN_NB_SEATS),
  }
}

const formatNumber = (value) =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(value)

function getNextBillingDate(accountDetails) {
  const timestamp = accountDetails.latestInvoice?.periodEnd
  return timestamp ? format(fromUnixTime(timestamp), 'MMMM do, yyyy') : null
}

function getSchema(accountDetails) {
  return yup.object().shape({
    seats: yup
      .number()
      .required('Number of seats is required')
      .integer()
      .min(
        MIN_NB_SEATS,
        `You cannot purchase a per user plan for less than ${MIN_NB_SEATS} users`
      )
      .test({
        name: 'between',
        test: (nbSeats) => nbSeats >= accountDetails.activatedUserCount,
        message: 'Must deactivate more users before downgrading plans',
      })
      .nullable()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? null : value
      ),
  })
}

function useUpgradeForm({ proPlanYear, proPlanMonth, accountDetails }) {
  const planOptions = [proPlanYear, proPlanMonth]
  const { register, handleSubmit, watch, formState, setValue, getValues } =
    useForm({
      defaultValues: getInitialDataForm(planOptions, accountDetails),
      resolver: yupResolver(getSchema(accountDetails)),
      mode: 'onChange',
    })

  const seats = watch('seats')
  const newPlan = watch('newPlan')

  const perYearPrice = Math.floor(seats) * proPlanYear.baseUnitPrice * 12
  const perMonthPrice = Math.floor(seats) * proPlanMonth.baseUnitPrice * 12

  const isPerYear = newPlan === 'users-pr-inappy'

  return {
    seats,
    newPlan,
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    planOptions,
    formState,
    setValue,
    getValues,
  }
}

function useSubmit({ owner, provider }) {
  const redirect = useHistory().push
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpgradePlan({ provider, owner })

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
          redirect(`/plan/${provider}/${owner}`)
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

  return { upgradePlan, ...rest }
}

function renderStudentText(activatedStudents) {
  if (activatedStudents < 1) {
    return null
  }

  return (
    <p className="mb-4 text-xs text-ds-gray-quinary">
      {activatedStudents === 1
        ? `*You have ${activatedStudents} active student that
        does not count towards the number of active users.`
        : `*You have ${activatedStudents} active students that
        do not count towards the number of active users.`}
    </p>
  )
}

function UpdateButton({ isValid, getValues, accountDetails }) {
  return (
    <Button
      data-cy="update"
      disabled={
        !isValid ||
        (getValues()?.newPlan === accountDetails?.plan?.value &&
          getValues()?.seats === accountDetails?.plan?.quantity)
      }
      type="submit"
      variant="primary"
      hook="submit-upgrade"
    >
      Update
    </Button>
  )
}

UpdateButton.propTypes = {
  isValid: PropType.bool,
  getValues: PropType.func,
  accountDetails: PropType.object,
}

function UpgradePlanForm({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  provider,
  owner,
}) {
  const nextBillingDate = getNextBillingDate(accountDetails)

  const {
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    setValue,
    getValues,
    formState: { isValid, errors },
  } = useUpgradeForm({ proPlanYear, proPlanMonth, accountDetails })

  const { upgradePlan } = useSubmit({ owner, provider })

  return (
    <form
      className="flex flex-col gap-4 text-ds-gray-nonary"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold">Billing</h3>
        <RadioInput
          key={proPlanYear.billingRate}
          data-cy={`select-${proPlanYear.billingRate}`}
          dataMarketing={`plan-pricing-option-${proPlanYear.billingRate}`}
          label={
            <>
              <span className="font-semibold">
                ${proPlanYear.baseUnitPrice}
              </span>
              /month, billed {proPlanYear.billingRate}
            </>
          }
          name="billing-options"
          value="users-pr-inappy"
          {...register('newPlan')}
        />
        <RadioInput
          key={proPlanMonth.billingRate}
          data-cy={`select-${proPlanMonth.billingRate}`}
          dataMarketing={`plan-pricing-option-${proPlanMonth.billingRate}`}
          label={
            <>
              <span className="font-semibold">
                ${proPlanMonth.baseUnitPrice}
              </span>
              /month, billed {proPlanMonth.billingRate}
            </>
          }
          name="billing-options"
          value="users-pr-inappm"
          {...register('newPlan')}
        />
      </div>
      <div className="flex flex-col gap-2">
        <TextInput
          data-cy="seats"
          dataMarketing="plan-pricing-seats"
          {...register('seats')}
          id="nb-seats"
          size="20"
          className="w-full rounded border bg-ds-gray-secondary p-2"
          type="number"
          label="User Seats"
        />
        <div className="border-l-2 pl-2">
          <p>
            Currently {accountDetails.activatedUserCount} users activated out of{' '}
            {accountDetails.activatedUserCount +
              accountDetails.inactiveUserCount}{' '}
            users.
          </p>
          {renderStudentText(accountDetails.activatedStudentCount)}
        </div>
      </div>
      <div className="bg-ds-gray-primary p-4">
        {isPerYear ? (
          <div className="flex flex-col gap-3">
            <p>
              <span className="font-semibold">
                {formatNumber(perYearPrice)}
              </span>
              /per year
            </p>
            <p>
              &#127881; You{' '}
              <span className="font-semibold">
                save {formatNumber(perMonthPrice - perYearPrice)}
              </span>{' '}
              with the annual plan
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p>
              <span className="font-semibold">
                {formatNumber(perMonthPrice / 12)}
              </span>
              /total monthly
            </p>
            <div className="flex flex-row gap-1">
              <Icon size="sm" name="light-bulb" variant="solid" />
              <p>
                You could save{' '}
                <span className="font-semibold">
                  {formatNumber(perMonthPrice - perYearPrice)}
                </span>{' '}
                a year with the annual plan,{' '}
                <span
                  className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
                  onClick={() => setValue('newPlan', 'users-pr-inappy')}
                >
                  switch to annual
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      {nextBillingDate && (
        <p className="mt-1 flex">
          Next Billing Date
          <span className="ml-auto">{nextBillingDate}</span>
        </p>
      )}
      {errors?.seats && (
        <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
          {errors.seats?.message}
        </p>
      )}
      <div className="w-min">
        <UpdateButton
          isValid={isValid}
          getValues={getValues}
          accountDetails={accountDetails}
        />
      </div>
    </form>
  )
}

UpgradePlanForm.propTypes = {
  proPlanYear: planPropType.isRequired,
  proPlanMonth: planPropType.isRequired,
  accountDetails: accountDetailsPropType,
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default UpgradePlanForm

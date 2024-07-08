import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import Button from 'ui/Button'
import { Card } from 'ui/Card'
import Icon from 'ui/Icon'
import TextInput from 'ui/TextInput'
import Toggle from 'ui/Toggle'

import { useOktaConfig } from '../hooks'

const FormSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  redirectUri: z.string().url('Redirect URI must be a valid URL'),
})

type FormValues = z.infer<typeof FormSchema>
interface URLParams {
  provider: string
  owner: string
}

export function OktaConfigForm() {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  })

  const { provider, owner } = useParams<URLParams>()

  const { data } = useOktaConfig({
    provider,
    username: owner,
  })
  const oktaConfig = data?.owner?.account?.oktaConfig
  const [oktaEnabled, setOktaEnabled] = useState(oktaConfig?.enabled)
  const [oktaLoginEnforce, setOktaLoginEnforce] = useState(oktaConfig?.enforced)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log('Form Data: ', data)
  }

  return (
    <Card>
      <Card.Content>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-4 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">
              Step 1: Enable Okta Sync
            </h2>
            <p>
              To connect Codecov with Okta, you need to enable the
              synchronization. Please enter the necessary Okta credentials below
              and toggle the sync option to start the synchronization process.
            </p>
          </div>
          <div className="flex flex-col gap-4 bg-ds-gray-primary p-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="clientId" className="block font-semibold">
                Client ID
              </label>
              <TextInput
                defaultValue={oktaConfig?.clientId}
                {...register('clientId', {
                  required: true,
                })}
                type="text"
                id="clientId"
                placeholder="Enter Client ID"
              />
              {formState.errors.clientId ? (
                <p className="mt-1 text-codecov-red">
                  {formState.errors.clientId.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="clientSecret" className="block font-semibold">
                Client Secret
              </label>
              <div className="relative">
                <TextInput
                  defaultValue={oktaConfig?.clientSecret}
                  {...register('clientSecret', { required: true })}
                  type={showPassword ? 'text' : 'password'}
                  id="clientSecret"
                  placeholder="Enter Client Secret"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5"
                >
                  <Icon
                    name={showPassword ? 'eye' : 'eyeOff'}
                    size="sm"
                    variant="solid"
                  />
                </button>
              </div>
              {formState.errors.clientSecret ? (
                <p className="mt-1 text-codecov-red">
                  {formState.errors.clientSecret.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="redirectUri" className="block font-semibold">
                Redirect URI
              </label>
              <TextInput
                defaultValue={oktaConfig?.url}
                {...register('redirectUri', { required: true })}
                type="text"
                id="redirectUri"
                placeholder="Enter Redirect URI"
              />
              {formState.errors.redirectUri ? (
                <p className="mt-1 text-codecov-red">
                  {formState.errors.redirectUri.message}
                </p>
              ) : null}
            </div>
            <div>
              <Button
                type="submit"
                disabled={!formState.isValid || !formState.isDirty}
                to={undefined}
                hook="save okta form changes"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
        <div className="flex flex-col gap-4">
          <Banner>
            <BannerContent>
              <div className="flex flex-col gap-3">
                <p>
                  Please note that we are unable to verify the Okta credentials.
                  After enabling sync, be sure to test the connection to ensure
                  it is functioning correctly. Additionally, you must toggle
                  enforce on to require Okta login
                </p>
                <Toggle
                  dataMarketing="okta-sync-enabled"
                  onClick={() => {
                    setOktaEnabled(!oktaEnabled)
                    if (oktaLoginEnforce) {
                      setOktaLoginEnforce(false)
                    }
                  }}
                  value={oktaEnabled}
                  label="Okta Sync Enabled"
                />
              </div>
            </BannerContent>
          </Banner>
          <hr />
          <h2 className="text-base font-semibold">
            Step 2: Enforce Okta Login
          </h2>
          <p>
            Once the synchronization with Okta is enabled, you can enforce Okta
            login for all users.
          </p>
          <Banner>
            <BannerContent>
              <div className="flex flex-col gap-3">
                <p>
                  Please note that enabling this will require all users to log
                  in to Codecov via Okta. Without successful verification, only
                  public repositories will be visible.
                </p>
                <Toggle
                  dataMarketing="okta-login-enforce"
                  onClick={() => {
                    setOktaLoginEnforce(!oktaLoginEnforce)
                    if (!oktaLoginEnforce) {
                      setOktaEnabled(true)
                    }
                  }}
                  value={oktaLoginEnforce}
                  label="Okta Login Enforced"
                />
              </div>
            </BannerContent>
          </Banner>
        </div>
      </Card.Content>
    </Card>
  )
}

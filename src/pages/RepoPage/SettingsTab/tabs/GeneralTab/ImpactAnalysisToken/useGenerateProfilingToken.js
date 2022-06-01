
import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'

export default function useGenerateProfilingToken() {
    const addToast = useAddNotification()
    const { mutate, data, ...rest } = useRegenerateProfilingToken()

    async function regenerateToken() {
        const err = data?.data?.regenerateProfilingToken?.error
        mutate()
        if (err) {
            addToast({
                type: 'error',
                text: err,
            })
        }
    }
    return { regenerateToken, data, ...rest }
}
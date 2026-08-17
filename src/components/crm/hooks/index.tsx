export * from '@/components/crm/hooks/modules/client'

import { createComponent, PropsState } from '@/utils'

/**新增客户**/
export async function fetchCrmClientcommonFeedbackConsumer(props: PropsState<Omix>) {
    return await import('@/components/crm/client/feedback/crm-client-common-feedback-consumer.vue').then(component => {
        return createComponent(component.default, props)
    })
}

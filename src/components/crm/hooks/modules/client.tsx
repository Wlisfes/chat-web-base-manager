import { createComponent, PropsState } from '@/utils'

/**新增普通客户**/
export async function fetchCrmCommonConsumer(props: PropsState<Omix>) {
    return await import('@/components/crm/client/feedback/crm-client-common-feedback-consumer.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增推广客户**/
export async function fetchCrmConspireConsumer(props: PropsState<Omix>) {
    return await import('@/components/crm/client/feedback/crm-client-common-feedback-consumer.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**添加短信应用**/
export async function fetchCrmSmsApplication(props: PropsState<Omix>) {
    return await import('@/components/crm/client/feedback/crm-client-common-feedback-sms.vue').then(component => {
        return createComponent(component.default, props)
    })
}

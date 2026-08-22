import { createComponent, PropsState } from '@/utils'

/**新增普通客户**/
export async function openCrmConsumerCreate(props: PropsState<Omix>) {
    return await import('@/components/crm/consumer/feedback/crm-consumer-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增推广客户**/
export async function openCrmPromotionConsumerCreate(props: PropsState<Omix>) {
    return await import('@/components/crm/consumer/feedback/crm-consumer-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**添加短信应用**/
export async function openCrmSmsApplicationCreate(props: PropsState<Omix>) {
    return await import('@/components/crm/sms-application/crm-sms-application-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

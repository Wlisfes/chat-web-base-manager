import { createComponent, PropsState } from '@/utils'

/**新增普通客户**/
export async function fetchCrmCommonUser(props: PropsState<Omix>) {
    return await import('@/components/crm/consumer/feedback/crm-common-user-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增推广客户**/
export async function fetchCrmCreateConspireUser(props: PropsState<Omix>) {
    // return await import('@/components/crm/consumer/feedback/chat-crm-user-feedback.vue').then(component => {
    //     return createComponent(component.default, props)
    // })
}

/**添加短信应用**/
export async function openCrmSmsAppCreate(props: PropsState<Omix>) {
    return await import('@/components/crm/sms-app/crm-sms-app-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

import { createComponent, PropsState } from '@/utils'

/**新增、编辑客户**/
export async function fetchFinanceAccountConsumer(props: PropsState<Omix>) {
    return await import('@/components/finance/account/feedback/finance-account-feedback-consumer.vue').then(component => {
        return createComponent(component.default, props)
    })
}

import { createComponent, PropsState } from '@/utils'

/**新增、编辑短信基础价格**/
export async function fetchFinanceRatesSms(props: PropsState<Omix>) {
    return await import('@/components/finance/rates/feedback/finance-rates-feedback-sms.vue').then(component => {
        return createComponent(component.default, props)
    })
}

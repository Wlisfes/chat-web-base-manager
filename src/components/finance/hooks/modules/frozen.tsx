import { createComponent, PropsState } from '@/utils'

/**新增、编辑短信基础价格**/
export async function fetchFinanceFrozenSms(props: PropsState<Omix>) {
    return await import('@/components/finance/frozen/feedback/finance-frozen-feedback-sms.vue').then(component => {
        return createComponent(component.default, props)
    })
}

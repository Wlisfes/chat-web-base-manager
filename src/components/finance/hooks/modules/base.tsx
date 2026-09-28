import { createComponent, PropsState } from '@/utils'

/**新增、编辑品牌**/
export async function fetchFinanceBaseBrand(props: PropsState<Omix>) {
    return await import('@/components/finance/base/feedback/finance-base-feedback-brand.vue').then(component => {
        return createComponent(component.default, props)
    })
}

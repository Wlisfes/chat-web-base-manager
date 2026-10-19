import { createComponent, PropsState } from '@/utils'

/**新增供应商**/
export async function fetchSrmSupplier(props: PropsState<Omix>) {
    return await import('@/components/srm/supplier/feedback/srm-supplier-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增 SIMBANK 设备**/
export async function fetchSrmSupplierSimbank(props: PropsState<Omix>) {
    return await import('@/components/srm/supplier/feedback/srm-supplier-simbank-feedback.vue').then(component => {
        return createComponent(component.default, props)
    })
}

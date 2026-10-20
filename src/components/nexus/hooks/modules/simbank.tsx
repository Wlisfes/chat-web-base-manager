import { createComponent, PropsState } from '@/utils'

/**新增、编辑 SIMBANK 设备**/
export async function fetchNexusSimbankManager(props: PropsState<Omix>) {
    return await import('@/components/nexus/simbank/feedback/nexus-simbank-feedback-manager.vue').then(component => {
        return createComponent(component.default, props)
    })
}

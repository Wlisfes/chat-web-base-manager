import { createComponent, PropsState } from '@/utils'

/**新增、编辑 SIMBANK 设备**/
export async function fetchNexusSimbankManager(props: PropsState<Omix>) {
    return await import('@/components/nexus/simbank/feedback/nexus-simbank-feedback-manager.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**插入 SIM 卡**/
export async function fetchNexusSimbankPortInsert(props: PropsState<Omix>) {
    return await import('@/components/nexus/simbank/feedback/nexus-simbank-feedback-port-insert.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**激活 SIM 卡**/
export async function fetchNexusSimbankPortActivate(props: PropsState<Omix>) {
    return await import('@/components/nexus/simbank/feedback/nexus-simbank-feedback-port-activate.vue').then(component => {
        return createComponent(component.default, props)
    })
}

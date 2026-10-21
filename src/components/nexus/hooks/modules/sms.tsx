import { createComponent, PropsState } from '@/utils'

/**新增、编辑短信通道**/
export async function fetchNexusSmsChannel(props: PropsState<Omix>) {
    return await import('@/components/nexus/sms/feedback/nexus-sms-feedback-channel.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**短信通道端口管理**/
export async function fetchNexusSmsChannelPort(props: PropsState<Omix>) {
    return await import('@/components/nexus/sms/feedback/nexus-sms-feedback-channel-port.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**短信通道绑定端口**/
export async function fetchNexusSmsChannelPortBind(props: PropsState<Omix>) {
    return await import('@/components/nexus/sms/feedback/nexus-sms-feedback-channel-port-bind.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增、编辑短信路由**/
export async function fetchNexusSmsRoute(props: PropsState<Omix>) {
    return await import('@/components/nexus/sms/feedback/nexus-sms-feedback-route.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**短信路由通道管理**/
export async function fetchNexusSmsRouteChannel(props: PropsState<Omix>) {
    return await import('@/components/nexus/sms/feedback/nexus-sms-feedback-route-channel.vue').then(component => {
        return createComponent(component.default, props)
    })
}

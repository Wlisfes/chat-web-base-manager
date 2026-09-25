import { createComponent, PropsState } from '@/utils'

/**新增、编辑系统枚举**/
export async function fetchDeployChunkSystem(props: PropsState<Omix>) {
    return await import('@/components/deploy/chunk/feedback/deploy-chunk-feedback-system.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**查看枚举列表**/
export async function fetchDeployChunkManager(props: PropsState<Omix>) {
    return await import('@/components/deploy/chunk/feedback/deploy-chunk-feedback-manager.vue').then(component => {
        return createComponent(component.default, props)
    })
}

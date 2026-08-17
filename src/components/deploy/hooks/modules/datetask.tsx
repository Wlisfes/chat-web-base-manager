import { createComponent, PropsState } from '@/utils'

/**修改Cron表达式**/
export async function fetchDeployDatetaskCron(props: PropsState<Omix>) {
    return await import('@/components/deploy/datetask/feedback/deploy-datetask-feedback-cron.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**查看执行日志**/
export async function fetchDeployDatetaskLog(props: PropsState<Omix>) {
    return await import('@/components/deploy/datetask/feedback/deploy-datetask-feedback-log.vue').then(component => {
        return createComponent(component.default, props)
    })
}

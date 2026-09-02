import { request } from '@/utils'
import type * as Datetask from '@/interface/deploy/deploy-datetask.resolver'

/**系统任务分页列表**/
export function httpBaseSystemColumnDatetask(data: Datetask.DatetaskColumnRequest) {
    return request<Datetask.DatetaskColumnResponse>({
        url: '/api/skyline/deploy/datetask/column',
        method: 'POST',
        data
    })
}

/**启用/停用任务**/
export function httpBaseSystemUpdateDatetaskStatus(data: Datetask.DatetaskStatusRequest) {
    return request<Datetask.DatetaskItem>({
        url: '/api/skyline/deploy/datetask/status/update',
        method: 'POST',
        data
    })
}

/**修改Cron表达式**/
export function httpBaseSystemUpdateDatetaskCron(data: Datetask.DatetaskCronRequest) {
    return request<Datetask.DatetaskItem>({
        url: '/api/skyline/deploy/datetask/cron/update',
        method: 'POST',
        data
    })
}

/**手动触发任务**/
export function httpBaseSystemTriggerDatetask(data: Datetask.DatetaskKeyRequest) {
    return request<Datetask.DatetaskTriggerResponse>({
        url: '/api/skyline/deploy/datetask/trigger',
        method: 'POST',
        data
    })
}

/**任务执行日志**/
export function httpBaseSystemColumnDatetaskLog(data: Datetask.DatetaskLogColumnRequest) {
    return request<Datetask.DatetaskLogColumnResponse>({
        url: '/api/skyline/deploy/datetask/log/column',
        method: 'POST',
        data
    })
}

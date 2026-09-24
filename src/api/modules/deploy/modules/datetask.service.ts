import { request } from '@/utils'
import type * as Datetask from '@/interface/deploy/deploy-datetask.resolver'

/**获取系统任务类型、任务状态和执行日志状态枚举**/
export function httpBaseSkylineDatetaskEnums() {
    return request<Datetask.DatetaskEnumsResponse>({
        url: '/api/skyline/deploy/datetask/enums',
        method: 'GET'
    })
}

/**系统任务分页列表**/
export function httpBaseSkylineColumnDatetask(data: Datetask.DatetaskColumnRequest) {
    return request<Datetask.DatetaskColumnResponse>({
        url: '/api/skyline/deploy/datetask/column',
        method: 'POST',
        data
    })
}

/**启用或停用系统任务**/
export function httpBaseSkylineUpdateDatetaskStatus(data: Datetask.DatetaskStatusRequest) {
    return request<Datetask.DatetaskItem>({
        url: '/api/skyline/deploy/datetask/status/update',
        method: 'POST',
        data
    })
}

/**修改系统任务 Cron 表达式**/
export function httpBaseSkylineUpdateDatetaskCron(data: Datetask.DatetaskCronRequest) {
    return request<Datetask.DatetaskItem>({
        url: '/api/skyline/deploy/datetask/cron/update',
        method: 'POST',
        data
    })
}

/**手动触发系统任务**/
export function httpBaseSkylineTriggerDatetask(data: Datetask.DatetaskKeyRequest) {
    return request<Datetask.DatetaskTriggerResponse>({
        url: '/api/skyline/deploy/datetask/trigger',
        method: 'POST',
        data
    })
}

/**系统任务执行日志**/
export function httpBaseSkylineColumnDatetaskLog(data: Datetask.DatetaskLogColumnRequest) {
    return request<Datetask.DatetaskLogColumnResponse>({
        url: '/api/skyline/deploy/datetask/log/column',
        method: 'POST',
        data
    })
}

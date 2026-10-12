import { request } from '@/utils'
import type * as Datetask from '@/interface/deploy/deploy-datetask.resolver'

/**获取任务所属模块、任务状态、执行状态和触发方式枚举**/
export function httpBaseSkylineDatetaskEnums() {
    return request<Datetask.DatetaskEnumsResponse>({
        url: '/api/skyline/deploy/datetask/enums',
        method: 'GET'
    })
}

/**系统任务分页列表**/
export function httpBaseSkylineColumnDatetask(data: Omix) {
    return request<Datetask.DatetaskColumnResponse>({
        url: '/api/skyline/deploy/datetask/column',
        method: 'POST',
        data
    })
}

/**启用或停用系统任务**/
export function httpBaseSkylineDatetaskStatusUpdate(data: Datetask.DatetaskStatusRequest) {
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

/**系统任务单条执行日志，用于手动触发后轮询结果**/
export function httpBaseSkylineResolverDatetaskLog(params: Datetask.DatetaskLogResolveRequest) {
    return request<Datetask.DatetaskLogItem>({
        url: '/api/skyline/deploy/datetask/log/resolve',
        method: 'GET',
        params
    })
}

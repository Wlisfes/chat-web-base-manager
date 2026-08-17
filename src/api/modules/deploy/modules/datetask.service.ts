import { request } from '@/utils'

/**系统任务分页列表**/
export function httpBaseSystemColumnDatetask(data: Omix) {
    return request({
        url: `/api/windows/deploy/datetask/column`,
        method: 'POST',
        data
    })
}

/**启用/停用任务**/
export function httpBaseSystemUpdateDatetaskStatus(data: Omix) {
    return request({
        url: `/api/windows/deploy/datetask/status/update`,
        method: 'POST',
        data
    })
}

/**修改Cron表达式**/
export function httpBaseSystemUpdateDatetaskCron(data: Omix) {
    return request({
        url: `/api/windows/deploy/datetask/cron/update`,
        method: 'POST',
        data
    })
}

/**手动触发任务**/
export function httpBaseSystemTriggerDatetask(data: Omix) {
    return request({
        url: `/api/windows/deploy/datetask/trigger`,
        method: 'POST',
        data
    })
}

/**任务执行日志**/
export function httpBaseSystemColumnDatetaskLog(data: Omix) {
    return request({
        url: `/api/windows/deploy/datetask/log/column`,
        method: 'POST',
        data
    })
}

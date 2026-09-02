/**系统任务类型。*/
export type DatetaskType = 'system' | 'cron' | 'manual'

/**系统任务状态。*/
export type DatetaskStatus = 'stop' | 'wait' | 'running' | 'finish'

/**系统任务执行日志状态。*/
export type DatetaskLogStatus = 'running' | 'success' | 'failed'

/**系统任务列表项。*/
export interface DatetaskItem {
    /**表主键，用于表格行标识和选择。*/
    keyId: number
    taskId: string
    taskName: string
    handler: string
    comment?: string | null
    cron?: string | null
    type: DatetaskType
    status: DatetaskStatus
    body?: Record<string, unknown> | null
    lastTime?: string | Date | null
    nextTime?: string | Date | null
    createTime?: string | Date | null
    modifyTime?: string | Date | null
}

/**系统任务分页查询请求体。*/
export interface DatetaskColumnRequest {
    page: number
    size: number
    taskName?: string
    status?: DatetaskStatus
}

/**系统任务分页响应数据。*/
export interface DatetaskColumnResponse {
    page: number
    size: number
    total: number
    list: DatetaskItem[]
}

/**系统任务主键请求体。*/
export interface DatetaskKeyRequest {
    taskId: string
}

/**系统任务状态更新请求体。*/
export interface DatetaskStatusRequest extends DatetaskKeyRequest {
    status: DatetaskStatus
}

/**系统任务 Cron 更新请求体。*/
export interface DatetaskCronRequest extends DatetaskKeyRequest {
    cron: string
}

/**系统任务触发响应数据。*/
export interface DatetaskTriggerResponse {
    success: boolean
    result?: unknown
}

/**系统任务执行日志项。*/
export interface DatetaskLogItem {
    taskId: string
    status: DatetaskLogStatus
    duration: number
    startTime: string
    endTime?: string | null
    result?: unknown
}

/**系统任务执行日志分页请求体。*/
export interface DatetaskLogColumnRequest extends DatetaskKeyRequest {
    page: number
    size: number
    status?: DatetaskLogStatus
}

/**系统任务执行日志分页响应数据。*/
export interface DatetaskLogColumnResponse {
    page: number
    size: number
    total: number
    list: DatetaskLogItem[]
}

/**系统任务类型。*/
export type DatetaskType = 'system' | 'cron' | 'manual'

/**系统任务状态。*/
export type DatetaskStatus = 'stop' | 'wait' | 'running' | 'finish'

/**系统任务可通过管理接口切换的状态。*/
export type DatetaskManageStatus = Extract<DatetaskStatus, 'stop' | 'running'>

/**系统任务执行日志状态。*/
export type DatetaskLogStatus = 'running' | 'success' | 'failed'

/**系统任务列表项。*/
export interface DatetaskItem {
    /**表主键，用于表格行标识和选择。*/
    keyId: number
    taskId: string
    taskName: string
    handler: string
    comment: string | null
    cron: string | null
    type: DatetaskType
    status: DatetaskStatus
    body: Record<string, unknown> | null
    lastTime: string | null
    nextTime: string | null
    createTime: string
    modifyTime: string
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
    status: DatetaskManageStatus
}

/**系统任务 Cron 更新请求体。*/
export interface DatetaskCronRequest extends DatetaskKeyRequest {
    cron: string
}

/**系统任务触发响应数据。*/
export interface DatetaskTriggerResponse {
    success: boolean
    result?: DatetaskExecutionResult
}

/**汇率同步结果明细。*/
export interface DatetaskExchangeRateItem {
    currency: string
    rate: number
    date: string
}

/**任务执行结果；同时覆盖汇率同步成功结果和跳过/错误结果。*/
export interface DatetaskExecutionResult {
    date?: string
    count?: number
    list?: DatetaskExchangeRateItem[]
    skipped?: boolean
    reason?: string
    message?: string
}

/**系统任务执行日志项。*/
export interface DatetaskLogItem {
    /**执行记录唯一标识，用于表格行标识。*/
    keyId: string
    taskId: string
    status: DatetaskLogStatus
    duration: number
    startTime: string
    endTime?: string | null
    result?: DatetaskExecutionResult
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

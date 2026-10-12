/**任务所属模块。*/
export type DatetaskModule = 'TASK_SYSTEM' | 'TASK_FINANCE' | 'TASK_CRM'

/**周期任务状态：enable=启用；disable=停用。*/
export type DatetaskStatus = 'enable' | 'disable'

/**执行状态：pending=待执行；running=执行中；retrying=等待重试；success=执行成功；failed=执行失败。*/
export type DatetaskLogStatus = 'pending' | 'running' | 'retrying' | 'success' | 'failed'

/**执行触发方式：system=系统执行；manual=手动执行。*/
export type DatetaskLogTrigger = 'system' | 'manual'

/**操作人展示选项；系统账号 uid 为 0。*/
export interface DatetaskOperatorOption {
    uid: string
    number?: string
    name?: string
    avatar?: string
}

/**周期任务列表项；任务由 chat-web-task-service 调度，Skyline 转发。*/
export interface DatetaskItem {
    /**表主键，用于表格行标识和选择。*/
    keyId: number
    taskId: string
    taskName: string
    module: DatetaskModule
    handler: string
    comment: string | null
    cron: string
    status: DatetaskStatus
    body: Record<string, unknown> | null
    /**单次执行最大尝试次数（含首次）。*/
    maxAttempts: number
    lastTime: string | null
    nextTime: string | null
    createBy: string
    modifyBy: string | null
    createTime: string
    modifyTime: string
    /**创建人选项。*/
    createByOptions?: DatetaskOperatorOption
    /**更新人选项。*/
    modifyByOptions?: DatetaskOperatorOption
}

/**周期任务分页查询请求体。*/
export interface DatetaskColumnRequest extends Omix {
    page: number
    size: number
    taskName?: string
    module?: DatetaskModule
    status?: DatetaskStatus
}

/**枚举下拉选项。*/
export interface DatetaskEnumOption<T extends string = string> {
    value: T
    label: string
    description: string
    type: string
}

/**系统任务静态枚举响应数据。*/
export interface DatetaskEnumsResponse {
    moduleOptions: DatetaskEnumOption<DatetaskModule>[]
    statusOptions: DatetaskEnumOption<DatetaskStatus>[]
    logStatusOptions: DatetaskEnumOption<DatetaskLogStatus>[]
    triggerTypeOptions: DatetaskEnumOption<DatetaskLogTrigger>[]
}

/**周期任务分页响应数据。*/
export interface DatetaskColumnResponse {
    page: number
    size: number
    total: number
    list: DatetaskItem[]
}

/**周期任务主键请求体。*/
export interface DatetaskKeyRequest {
    taskId: string
}

/**周期任务状态更新请求体。*/
export interface DatetaskStatusRequest extends DatetaskKeyRequest {
    status: DatetaskStatus
}

/**周期任务 Cron 更新请求体。*/
export interface DatetaskCronRequest extends DatetaskKeyRequest {
    cron: string
}

/**执行记录（执行日志）项；一次触发一条，重试只累加尝试次数。*/
export interface DatetaskLogItem {
    /**表主键，用于表格行标识。*/
    keyId: number
    /**执行记录ID。*/
    executionId: string
    taskId: string
    taskName: string
    handler: string
    /**业务幂等键。*/
    bizKey: string
    triggerType: DatetaskLogTrigger
    status: DatetaskLogStatus
    /**已尝试次数。*/
    attempts: number
    /**最大尝试次数。*/
    maxAttempts: number
    /**计划执行时间。*/
    scheduledTime: string
    /**下次重试时间。*/
    nextRetryTime?: string | null
    startTime?: string | null
    endTime?: string | null
    /**最后一次尝试耗时（毫秒）。*/
    duration: number
    /**执行结果摘要。*/
    result?: Record<string, unknown> | null
    /**最后一次失败原因。*/
    error?: string | null
    /**触发人 UID，系统执行为 0。*/
    createBy: string
    modifyBy: string | null
    createTime: string
    modifyTime: string
    /**触发人选项。*/
    createByOptions?: DatetaskOperatorOption
}

/**手动触发响应：finished 为 false 时按 executionId 轮询执行日志详情。*/
export interface DatetaskTriggerResponse {
    executionId: string
    finished: boolean
    execution: DatetaskLogItem
}

/**执行日志分页请求体。*/
export interface DatetaskLogColumnRequest extends DatetaskKeyRequest {
    page: number
    size: number
    status?: DatetaskLogStatus
}

/**单条执行日志请求参数。*/
export interface DatetaskLogResolveRequest {
    executionId: string
}

/**执行日志分页响应数据。*/
export interface DatetaskLogColumnResponse {
    page: number
    size: number
    total: number
    list: DatetaskLogItem[]
}

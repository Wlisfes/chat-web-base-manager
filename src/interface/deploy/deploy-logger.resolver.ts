/**操作结果：success=成功；failure=失败。*/
export type LoggerResult = 'success' | 'failure'

/**操作结果展示选项，与后端 TbSkylineLoggerResultDefinition 一致。*/
export const LOGGER_RESULT_OPTIONS = [
    { value: 'success', label: '成功', description: '接口执行成功', type: 'success' },
    { value: 'failure', label: '失败', description: '接口执行失败', type: 'error' }
]

/**HTTP 方法展示选项。*/
export const LOGGER_METHOD_OPTIONS = [
    { value: 'GET', label: 'GET', type: 'info' },
    { value: 'POST', label: 'POST', type: 'success' },
    { value: 'PUT', label: 'PUT', type: 'warning' },
    { value: 'PATCH', label: 'PATCH', type: 'warning' },
    { value: 'DELETE', label: 'DELETE', type: 'error' }
]

/**操作日志列表项。列表接口返回完整记录，详情可查看请求体和客户端 IP。*/
export interface LoggerItem extends Omix {
    keyId: number
    logId: string
    serviceName: string
    permissionCode: string
    sheetKeyId?: number | null
    sheetName?: string | null
    resourceType?: string | null
    resourceId?: string | null
    operatorUid?: string | null
    operatorNumber?: string | null
    operatorName?: string | null
    method: string
    url: string
    ip?: string | null
    result: LoggerResult
    message?: string | null
    requestBody?: string | null
    createTime: string
}

/**操作日志分页查询请求体。选中目录或菜单时，后端包含其全部下级按钮。*/
export interface LoggerColumnRequest extends Omix {
    page: number
    size: number
    sheetKeyId?: number
    /**操作人姓名或工号，模糊匹配。*/
    operatorName?: string
    /**请求日志号。*/
    logId?: string
    startTime?: string
    endTime?: string
}

/**操作日志分页响应数据。*/
export interface LoggerColumnResponse {
    page: number
    size: number
    total: number
    list: LoggerItem[]
}

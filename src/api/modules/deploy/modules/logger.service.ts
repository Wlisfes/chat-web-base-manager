import { request } from '@/utils'
import type * as Logger from '@/interface/deploy/deploy-logger.resolver'

/**操作日志分页列表**/
export function httpBaseSkylineColumnLogger(data: Logger.LoggerColumnRequest) {
    return request<Logger.LoggerColumnResponse>({
        url: '/api/skyline/deploy/logger/column',
        method: 'POST',
        data
    })
}

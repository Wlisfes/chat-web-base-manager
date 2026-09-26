import { request } from '@/utils'

/**客户关系管理-短信应用分页列表**/
export function httpBaseCrmColumnSmsApplication(data: Omix) {
    return request({
        url: '/api/crm/sms/application/column',
        method: 'POST',
        data
    })
}

/**客户关系管理-新增短信应用**/
export function httpBaseCrmCreateSmsApplication(data: Omix) {
    return request({
        url: '/api/crm/sms/application/create',
        method: 'POST',
        data
    })
}

/**客户关系管理-更新短信应用**/
export function httpBaseCrmUpdateSmsApplication(data: Omix) {
    return request({
        url: '/api/crm/sms/application/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-客户短信应用下拉列表**/
export function httpBaseCrmSelectSmsApplication(data: Omix) {
    return request({
        url: '/api/crm/sms/application/select',
        method: 'POST',
        data
    })
}

import { request } from '@/utils'

/**客户关系管理-短信应用静态枚举**/
export function httpBaseCrmSmsAppEnums() {
    return request({
        url: '/api/crm/sms/app/enums',
        method: 'GET'
    })
}

/**客户关系管理-短信应用分页列表**/
export function httpBaseCrmColumnSmsApp(data: Omix) {
    return request({
        url: '/api/crm/sms/app/column',
        method: 'POST',
        data
    })
}

/**客户关系管理-新增短信应用**/
export function httpBaseCrmCreateSmsApp(data: Omix) {
    return request({
        url: '/api/crm/sms/app/create',
        method: 'POST',
        data
    })
}

/**客户关系管理-更新短信应用**/
export function httpBaseCrmUpdateSmsApp(data: Omix) {
    return request({
        url: '/api/crm/sms/app/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-客户短信应用下拉列表**/
export function httpBaseCrmSelectSmsApp(data: Omix) {
    return request({
        url: '/api/crm/sms/app/select',
        method: 'POST',
        data
    })
}

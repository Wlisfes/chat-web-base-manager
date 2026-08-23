import { request } from '@/utils'

const SMS_APPLICATION_API = '/api/crm/sms/application'

/** 客户关系管理-短信应用分页列表。 */
export function httpBaseCrmColumnSmsApplication(data: Omix) {
    return request({
        url: `${SMS_APPLICATION_API}/column`,
        method: 'POST',
        data
    })
}

/** 客户关系管理-新增短信应用。 */
export function httpBaseCrmCreateSmsApplication(data: Omix) {
    return request({
        url: `${SMS_APPLICATION_API}/create`,
        method: 'POST',
        data
    })
}

/** 客户关系管理-更新短信应用。 */
export function httpBaseCrmUpdateSmsApplication(data: Omix) {
    return request({
        url: `${SMS_APPLICATION_API}/update`,
        method: 'POST',
        data
    })
}

/** 客户关系管理-客户短信应用下拉列表。 */
export function httpBaseCrmSelectSmsApplication(data: Omix) {
    return request({
        url: `${SMS_APPLICATION_API}/select`,
        method: 'POST',
        data
    })
}

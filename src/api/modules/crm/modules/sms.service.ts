import { request } from '@/utils'

/**客户关系管理-短信应用静态枚举**/
export function httpBaseCrmSmsAppEnums() {
    return request({
        url: '/api/sms/app/enums',
        method: 'GET'
    })
}

/**客户关系管理-短信报价静态枚举**/
export function httpBaseCrmSmsQuoteEnums() {
    return request({
        url: '/api/sms/quote/enums',
        method: 'GET'
    })
}

/**客户关系管理-短信应用分页列表**/
export function httpBaseCrmColumnSmsApp(data: Omix) {
    return request({
        url: '/api/sms/app/column',
        method: 'POST',
        data
    })
}

/**客户关系管理-新增短信应用**/
export function httpBaseCrmCreateSmsApp(data: Omix) {
    return request({
        url: '/api/sms/app/create',
        method: 'POST',
        data
    })
}

/**客户关系管理-更新短信应用**/
export function httpBaseCrmUpdateSmsApp(data: Omix) {
    return request({
        url: '/api/sms/app/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-客户短信应用下拉列表**/
export function httpBaseCrmSelectSmsApp(data: Omix) {
    return request({
        url: '/api/sms/app/select',
        method: 'POST',
        data
    })
}

/**客户关系管理-初始化短信报价草稿**/
export function httpBaseCrmInitSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/sms/quote/draft/init',
        method: 'POST',
        data
    })
}

/**客户关系管理-短信报价草稿分页列表**/
export function httpBaseCrmColumnSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/sms/quote/draft/column',
        method: 'POST',
        data
    })
}

/**客户关系管理-修改短信报价草稿**/
export function httpBaseCrmUpdateSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/sms/quote/draft/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-批量删除短信报价草稿**/
export function httpBaseCrmDeleteSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/sms/quote/draft/delete',
        method: 'POST',
        data
    })
}

/**客户关系管理-预览短信报价**/
export function httpBaseCrmPreviewSmsQuote(data: Omix) {
    return request({
        url: '/api/sms/quote/preview',
        method: 'POST',
        data
    })
}

/**客户关系管理-发布短信报价**/
export function httpBaseCrmPublishSmsQuote(data: Omix) {
    return request({
        url: '/api/sms/quote/publish',
        method: 'POST',
        data
    })
}

/**客户关系管理-正式短信报价分页列表**/
export function httpBaseCrmColumnSmsQuote(data: Omix) {
    return request({
        url: '/api/sms/quote/column',
        method: 'POST',
        data
    })
}

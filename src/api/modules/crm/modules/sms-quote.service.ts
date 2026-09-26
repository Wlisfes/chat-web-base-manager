import { request } from '@/utils'

/**客户关系管理-初始化短信报价草稿**/
export function httpBaseCrmInitSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/draft/init',
        method: 'POST',
        data
    })
}

/**客户关系管理-短信报价草稿分页列表**/
export function httpBaseCrmColumnSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/draft/column',
        method: 'POST',
        data
    })
}

/**客户关系管理-修改短信报价草稿**/
export function httpBaseCrmUpdateSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/draft/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-批量删除短信报价草稿**/
export function httpBaseCrmDeleteSmsQuoteDraft(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/draft/delete',
        method: 'POST',
        data
    })
}

/**客户关系管理-预览短信报价**/
export function httpBaseCrmPreviewSmsQuote(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/preview',
        method: 'POST',
        data
    })
}

/**客户关系管理-发布短信报价**/
export function httpBaseCrmPublishSmsQuote(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/publish',
        method: 'POST',
        data
    })
}

/**客户关系管理-正式短信报价分页列表**/
export function httpBaseCrmColumnSmsQuote(data: Omix) {
    return request({
        url: '/api/crm/sms/quote/column',
        method: 'POST',
        data
    })
}

import { request } from '@/utils'

/**客户关系管理-simbank 报价静态枚举**/
export function httpBaseSrmSimbankQuoteEnums() {
    return request({
        url: '/api/srm/quote/enums',
        method: 'GET'
    })
}

/**客户关系管理-初始化simbank 报价草稿**/
export function httpBaseSrmInitSimbankQuoteDraft(data: Omix) {
    return request({
        url: '/api/srm/quote/draft/init',
        method: 'POST',
        data
    })
}

/**客户关系管理-simbank 报价草稿分页列表**/
export function httpBaseSrmColumnSimbankQuoteDraft(data: Omix) {
    return request({
        url: '/api/srm/quote/draft/column',
        method: 'POST',
        data
    })
}

/**客户关系管理-修改simbank 报价草稿**/
export function httpBaseSrmUpdateSimbankQuoteDraft(data: Omix) {
    return request({
        url: '/api/srm/quote/draft/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-批量变更simbank 报价草稿状态（删除/恢复）**/
export function httpBaseSrmUpdateSimbankQuoteDraftStatus(data: Omix) {
    return request({
        url: '/api/srm/quote/draft/status/update',
        method: 'POST',
        data
    })
}

/**客户关系管理-批量移除simbank 报价草稿（物理删除）**/
export function httpBaseSrmDeleteSimbankQuoteDraft(data: Omix) {
    return request({
        url: '/api/srm/quote/draft/delete',
        method: 'POST',
        data
    })
}

/**客户关系管理-发布simbank 报价**/
export function httpBaseSrmPublishSimbankQuote(data: Omix) {
    return request({
        url: '/api/srm/quote/publish',
        method: 'POST',
        data
    })
}

/**客户关系管理-正式simbank 报价分页列表**/
export function httpBaseSrmColumnSimbankQuote(data: Omix) {
    return request({
        url: '/api/srm/quote/column',
        method: 'POST',
        data
    })
}

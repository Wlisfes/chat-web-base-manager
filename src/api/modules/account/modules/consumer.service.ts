import { request } from '@/utils'

/**新增外部客户**/
export function httpBaseAccountCreateConsumer(data: Omix) {
    return request({
        url: '/api/account/consumer/create',
        method: 'POST',
        data
    })
}

/**编辑外部客户**/
export function httpBaseAccountUpdateConsumer(data: Omix) {
    return request({
        url: '/api/account/consumer/update',
        method: 'POST',
        data
    })
}

/**查询外部客户分页列表**/
export function httpBaseAccountColumnConsumer(data: Omix) {
    return request({
        url: '/api/account/consumer/column',
        method: 'POST',
        data
    })
}

/**修改外部客户状态**/
export function httpBaseAccountUpdateConsumerStatus(data: Omix) {
    return request({
        url: '/api/account/consumer/update/status',
        method: 'POST',
        data
    })
}

/**查询外部客户详情**/
export function httpBaseAccountResolverConsumer(params: Omix) {
    return request({
        url: '/api/account/consumer/resolve',
        method: 'GET',
        params
    })
}

/**查询可用外部客户下拉列表**/
export function httpBaseAccountSelectConsumer(params: Omix = {}) {
    return request({
        url: '/api/account/consumer/select',
        method: 'GET',
        params
    })
}

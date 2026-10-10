import { request } from '@/utils'

/**消费客户静态枚举**/
export function httpBaseCrmUserEnums() {
    return request({
        url: '/api/crm/user/enums',
        method: 'GET'
    })
}

/**随机生成新增消费客户表单数据**/
export function httpBaseCrmFakerUser() {
    return request({
        url: '/api/crm/user/faker',
        method: 'GET'
    })
}

/**新增消费客户**/
export function httpBaseCrmCreateUser(data: Omix) {
    return request({
        url: '/api/crm/user/create',
        method: 'POST',
        data
    })
}

/**编辑消费客户**/
export function httpBaseCrmUpdateUser(data: Omix) {
    return request({
        url: '/api/crm/user/update',
        method: 'POST',
        data
    })
}

/**查询消费客户分页列表**/
export function httpBaseCrmColumnUser(data: Omix) {
    return request({
        url: '/api/crm/user/column',
        method: 'POST',
        data
    })
}

/**修改消费客户状态**/
export function httpBaseCrmUserStatusUpdate(data: Omix) {
    return request({
        url: '/api/crm/user/status/update',
        method: 'POST',
        data
    })
}

/**查询消费客户详情**/
export function httpBaseCrmUserResolver(params: Omix) {
    return request({
        url: '/api/crm/user/resolve',
        method: 'GET',
        params
    })
}

/**查询可用消费客户下拉列表**/
export function httpBaseCrmSelectUser(params: Omix = {}) {
    return request({
        url: '/api/crm/user/select',
        method: 'GET',
        params
    })
}

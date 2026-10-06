import { request } from '@/utils'

/**外部客户静态枚举**/
export function httpBaseCrmUserEnums() {
    return request({
        url: '/api/crm/user/enums',
        method: 'GET'
    })
}

/**新增外部客户**/
export function httpBaseCrmCreateUser(data: Omix) {
    return request({
        url: '/api/crm/user/create',
        method: 'POST',
        data
    })
}

/**编辑外部客户**/
export function httpBaseCrmUpdateUser(data: Omix) {
    return request({
        url: '/api/crm/user/update',
        method: 'POST',
        data
    })
}

/**查询外部客户分页列表**/
export function httpBaseCrmColumnUser(data: Omix) {
    return request({
        url: '/api/crm/user/column',
        method: 'POST',
        data
    })
}

/**修改外部客户状态**/
export function httpBaseCrmUserStatusUpdate(data: Omix) {
    return request({
        url: '/api/crm/user/status/update',
        method: 'POST',
        data
    })
}

/**查询外部客户详情**/
export function httpBaseCrmUserResolver(params: Omix) {
    return request({
        url: '/api/crm/user/resolve',
        method: 'GET',
        params
    })
}

/**查询可用外部客户下拉列表**/
export function httpBaseCrmSelectUser(params: Omix = {}) {
    return request({
        url: '/api/crm/user/select',
        method: 'GET',
        params
    })
}

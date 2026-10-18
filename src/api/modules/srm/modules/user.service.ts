import { request } from '@/utils'

/**供应商静态枚举**/
export function httpBaseSrmUserEnums() {
    return request({
        url: '/api/srm/user/enums',
        method: 'GET'
    })
}

/**随机生成新增供应商表单数据**/
export function httpBaseSrmUserFaker() {
    return request({
        url: '/api/srm/user/faker',
        method: 'GET'
    })
}

/**新增供应商**/
export function httpBaseSrmCreateUser(data: Omix) {
    return request({
        url: '/api/srm/user/create',
        method: 'POST',
        data
    })
}

/**编辑供应商**/
export function httpBaseSrmUpdateUser(data: Omix) {
    return request({
        url: '/api/srm/user/update',
        method: 'POST',
        data
    })
}

/**查询供应商分页列表**/
export function httpBaseSrmColumnUser(data: Omix) {
    return request({
        url: '/api/srm/user/column',
        method: 'POST',
        data
    })
}

/**修改供应商状态**/
export function httpBaseSrmUserStatusUpdate(data: Omix) {
    return request({
        url: '/api/srm/user/status/update',
        method: 'POST',
        data
    })
}

/**查询供应商详情**/
export function httpBaseSrmUserResolver(params: Omix) {
    return request({
        url: '/api/srm/user/resolve',
        method: 'GET',
        params
    })
}

/**查询可用供应商下拉列表**/
export function httpBaseSrmSelectUser(params: Omix = {}) {
    return request({
        url: '/api/srm/user/select',
        method: 'GET',
        params
    })
}

/**查询供应商配置**/
export function httpBaseSrmUserConfigResolver(params: Omix) {
    return request({
        url: '/api/srm/user/config/resolve',
        method: 'GET',
        params
    })
}

/**新增供应商联系人**/
export function httpBaseSrmCreateUserContact(data: Omix) {
    return request({
        url: '/api/srm/user/contact/create',
        method: 'POST',
        data
    })
}

/**编辑供应商联系人**/
export function httpBaseSrmUpdateUserContact(data: Omix) {
    return request({
        url: '/api/srm/user/contact/update',
        method: 'POST',
        data
    })
}

/**修改供应商联系人状态**/
export function httpBaseSrmUserContactStatusUpdate(data: Omix) {
    return request({
        url: '/api/srm/user/contact/status/update',
        method: 'POST',
        data
    })
}

/**查询供应商联系人列表**/
export function httpBaseSrmColumnUserContact(data: Omix) {
    return request({
        url: '/api/srm/user/contact/column',
        method: 'POST',
        data
    })
}

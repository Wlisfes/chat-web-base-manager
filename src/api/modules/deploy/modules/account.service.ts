import { request } from '@/utils'

const USER_API = '/api/account/user'

/**新增账号**/
export function httpBaseSystemCreateAccount(data: Omix) {
    return request({
        url: `${USER_API}/create`,
        method: 'POST',
        data
    })
}

/**账号列表**/
export function httpBaseSystemColumnAccount(data: Omix) {
    return request({
        url: `${USER_API}/column`,
        method: 'POST',
        data
    })
}

/**编辑账号基础信息。*/
export function httpBaseSystemUpdateAccount(data: Omix) {
    return request({ url: `${USER_API}/update`, method: 'POST', data })
}

/**编辑账号组织关系。*/
export function httpBaseSystemUpdateAccountOrganization(data: Omix) {
    return request({
        url: `${USER_API}/update/organization`,
        method: 'POST',
        data
    })
}

/**账号详情**/
export function httpBaseSystemAccountResolver(params: Omix) {
    return request({
        url: `${USER_API}/resolver`,
        method: 'GET',
        params
    })
}

/**编辑账号状态**/
export function httpBaseSystemUpdateSwitchAccount(data: Omix) {
    return request({ url: `${USER_API}/update`, method: 'POST', data })
}

/**账号服务暂不提供物理删除，调用方应使用禁用状态**/
export function httpBaseSystemDeleteAccount(data: Omix) {
    return request({ url: `${USER_API}/update`, method: 'POST', data })
}

/**重置密码**/
export function httpBaseSystemResetPasswordAccount(data: Omix) {
    return request({
        url: `${USER_API}/reset/password`,
        method: 'POST',
        data
    })
}

/**账号下拉列表**/
export function httpBaseSystemSelectAccount(data: Omix) {
    return request({
        url: `${USER_API}/column`,
        method: 'POST',
        data
    })
}

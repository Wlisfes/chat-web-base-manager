import { request } from '@/utils'

/**新增账号**/
export function httpBaseSystemCreateAccount(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/create`,
        method: 'POST',
        data
    })
}

/**账号列表**/
export function httpBaseSystemColumnAccount(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/column`,
        method: 'POST',
        data
    })
}

/**编辑账号**/
export function httpBaseSystemUpdateAccount(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/update`,
        method: 'POST',
        data
    })
}

/**账号详情**/
export function httpBaseSystemAccountResolver(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/resolver`,
        method: 'POST',
        data
    })
}

/**编辑账号状态**/
export function httpBaseSystemUpdateSwitchAccount(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/switch/update`,
        method: 'POST',
        data
    })
}

/**删除账号**/
export function httpBaseSystemDeleteAccount(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/delete`,
        method: 'POST',
        data
    })
}

/**重置密码**/
export function httpBaseSystemResetPasswordAccount(data: Omix) {
    return request({
        url: `/api/windows/deploy/account/reset/password`,
        method: 'POST',
        data
    })
}

/**账号下拉列表**/
export function httpBaseSystemSelectAccount() {
    return request({
        url: `/api/windows/deploy/account/select`,
        method: 'POST'
    })
}

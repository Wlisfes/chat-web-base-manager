import { request } from '@/utils'

/**账号登录**/
export function httpAuthAccountToken(data: Omix) {
    return request({
        url: `/api/windows/auth/token/login`,
        method: 'POST',
        data
    })
}

/**登录续时**/
export function httpAuthAccountTokenContinue() {
    return request({
        url: `/api/windows/auth/token/continue`,
        method: 'POST'
    })
}

/**登录账户信息**/
export function httpAuthAccountTokenResolver() {
    return request({
        url: `/api/windows/auth/token/resolver`,
        method: 'GET'
    })
}

/**登录账户权限**/
export function httpAuthAccountTokenResource() {
    return request({
        url: `/api/windows/auth/token/resource`,
        method: 'GET'
    })
}

/**登录账户按钮权限**/
export function httpAuthAccountTokenSheet() {
    return request({
        url: `/api/windows/auth/token/sheet`,
        method: 'GET'
    })
}

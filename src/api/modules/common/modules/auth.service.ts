import { request } from '@/utils'

/**账号登录**/
export function httpAuthAccountToken(data: Omix) {
    return request({
        url: `/api/auth/login`,
        method: 'POST',
        data
    })
}

/**登录续时**/
export function httpAuthAccountTokenContinue() {
    return request({
        url: `/api/auth/refresh`,
        method: 'POST'
    })
}

/**登录账户信息**/
export function httpAuthAccountTokenResolver() {
    return request({
        url: `/api/auth/me`,
        method: 'GET'
    })
}

/**登录账户菜单和按钮权限**/
export function httpAuthAccountPermissions() {
    return request({
        url: `/api/permissions/me`,
        method: 'GET'
    })
}

/**退出登录并撤销服务端会话**/
export function httpAuthAccountTokenLogout() {
    return request({
        url: `/api/auth/logout`,
        method: 'POST'
    })
}

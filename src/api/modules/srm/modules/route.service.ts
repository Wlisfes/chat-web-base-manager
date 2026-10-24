import { request } from '@/utils'

/**路由静态枚举**/
export function httpBaseSrmRouteEnums() {
    return request({
        url: '/api/srm/route/enums',
        method: 'GET'
    })
}

/**新增路由**/
export function httpBaseSrmCreateRoute(data: Omix) {
    return request({
        url: '/api/srm/route/create',
        method: 'POST',
        data
    })
}

/**编辑路由**/
export function httpBaseSrmUpdateRoute(data: Omix) {
    return request({
        url: '/api/srm/route/update',
        method: 'POST',
        data
    })
}

/**路由详情**/
export function httpBaseSrmRouteResolver(params: Omix) {
    return request({
        url: '/api/srm/route/resolve',
        method: 'GET',
        params
    })
}

/**删除路由**/
export function httpBaseSrmDeleteRoute(data: Omix) {
    return request({
        url: '/api/srm/route/delete',
        method: 'POST',
        data
    })
}

/**分页查询路由**/
export function httpBaseSrmColumnRoute(data: Omix) {
    return request({
        url: '/api/srm/route/column',
        method: 'POST',
        data
    })
}

/**更新路由规则绑定**/
export function httpBaseSrmBindRouteRule(data: Omix) {
    return request({
        url: '/api/srm/route/rule/bind',
        method: 'POST',
        data
    })
}

/**更新路由通道绑定**/
export function httpBaseSrmBindRouteChannel(data: Omix) {
    return request({
        url: '/api/srm/route/channel/bind',
        method: 'POST',
        data
    })
}

/**短信应用绑定路由**/
export function httpBaseSrmBindRouteApp(data: Omix) {
    return request({
        url: '/api/srm/route/app/bind',
        method: 'POST',
        data
    })
}

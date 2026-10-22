import { request } from '@/utils'

/**路由静态枚举**/
export function httpBaseSrmRouteEnums() {
    return request({ url: '/api/srm/route/enums', method: 'GET' })
}

/**新增路由**/
export function httpBaseSrmCreateRoute(data: Omix) {
    return request({ url: '/api/srm/route/create', method: 'POST', data })
}

/**编辑路由**/
export function httpBaseSrmUpdateRoute(data: Omix) {
    return request({ url: '/api/srm/route/update', method: 'POST', data })
}

/**路由详情**/
export function httpBaseSrmRouteResolver(params: Omix) {
    return request({ url: '/api/srm/route/resolve', method: 'GET', params })
}

/**删除路由**/
export function httpBaseSrmDeleteRoute(data: Omix) {
    return request({ url: '/api/srm/route/delete', method: 'POST', data })
}

/**分页查询路由**/
export function httpBaseSrmColumnRoute(data: Omix) {
    return request({ url: '/api/srm/route/column', method: 'POST', data })
}

/**路由下拉选项**/
export function httpBaseSrmSelectRoute() {
    return request({ url: '/api/srm/route/select', method: 'GET' })
}

/**新增规则组**/
export function httpBaseSrmCreateRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/create', method: 'POST', data })
}

/**编辑规则组**/
export function httpBaseSrmUpdateRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/update', method: 'POST', data })
}

/**删除规则组**/
export function httpBaseSrmDeleteRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/delete', method: 'POST', data })
}

/**查询路由下的规则组**/
export function httpBaseSrmListRouteRule(params: Omix) {
    return request({ url: '/api/srm/route/rule/list', method: 'GET', params })
}

/**更新路由通道绑定**/
export function httpBaseSrmBindRouteChannel(data: Omix) {
    return request({ url: '/api/srm/route/channel/bind', method: 'POST', data })
}

/**编辑路由通道优先级、权重和状态**/
export function httpBaseSrmUpdateRouteChannel(data: Omix) {
    return request({ url: '/api/srm/route/channel/update', method: 'POST', data })
}

/**从路由移除通道**/
export function httpBaseSrmDeleteRouteChannel(data: Omix) {
    return request({ url: '/api/srm/route/channel/delete', method: 'POST', data })
}

/**查询路由下的通道**/
export function httpBaseSrmListRouteChannel(params: Omix) {
    return request({ url: '/api/srm/route/channel/list', method: 'GET', params })
}

/**短信应用绑定路由**/
export function httpBaseSrmBindRouteApp(data: Omix) {
    return request({ url: '/api/srm/route/app/bind', method: 'POST', data })
}

/**短信应用解绑路由**/
export function httpBaseSrmUnbindRouteApp(data: Omix) {
    return request({ url: '/api/srm/route/app/unbind', method: 'POST', data })
}

/**分页查询短信应用路由绑定**/
export function httpBaseSrmColumnRouteApp(data: Omix) {
    return request({ url: '/api/srm/route/app/column', method: 'POST', data })
}

/**选路预览**/
export function httpBaseSrmRoutePreview(data: Omix) {
    return request({ url: '/api/srm/route/preview', method: 'POST', data })
}

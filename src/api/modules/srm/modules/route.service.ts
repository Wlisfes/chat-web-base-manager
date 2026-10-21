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

/**新增路由规则**/
export function httpBaseSrmCreateRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/create', method: 'POST', data })
}

/**编辑路由规则状态和备注**/
export function httpBaseSrmUpdateRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/update', method: 'POST', data })
}

/**删除路由规则**/
export function httpBaseSrmDeleteRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/delete', method: 'POST', data })
}

/**分页查询路由规则**/
export function httpBaseSrmColumnRouteRule(data: Omix) {
    return request({ url: '/api/srm/route/rule/column', method: 'POST', data })
}

/**路由规则加入通道**/
export function httpBaseSrmCreateRouteChannel(data: Omix) {
    return request({ url: '/api/srm/route/rule/channel/create', method: 'POST', data })
}

/**编辑规则通道优先级、权重和状态**/
export function httpBaseSrmUpdateRouteChannel(data: Omix) {
    return request({ url: '/api/srm/route/rule/channel/update', method: 'POST', data })
}

/**从路由规则移除通道**/
export function httpBaseSrmDeleteRouteChannel(data: Omix) {
    return request({ url: '/api/srm/route/rule/channel/delete', method: 'POST', data })
}

/**查询路由规则下的通道**/
export function httpBaseSrmListRouteChannel(params: Omix) {
    return request({ url: '/api/srm/route/rule/channel/list', method: 'GET', params })
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

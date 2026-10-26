import { request } from '@/utils'

/**通道静态枚举**/
export function httpBaseSrmChannelEnums() {
    return request({
        url: '/api/srm/channel/enums',
        method: 'GET'
    })
}

/**新增通道**/
export function httpBaseSrmCreateChannel(data: Omix) {
    return request({
        url: '/api/srm/channel/create',
        method: 'POST',
        data
    })
}

/**编辑通道**/
export function httpBaseSrmUpdateChannel(data: Omix) {
    return request({
        url: '/api/srm/channel/update',
        method: 'POST',
        data
    })
}

/**启用、停用通道**/
export function httpBaseSrmChannelStatusUpdate(data: Omix) {
    return request({
        url: '/api/srm/channel/status/update',
        method: 'POST',
        data
    })
}

/**删除通道**/
export function httpBaseSrmDeleteChannel(data: Omix) {
    return request({
        url: '/api/srm/channel/delete',
        method: 'POST',
        data
    })
}

/**通道详情**/
export function httpBaseSrmChannelResolver(params: Omix) {
    return request({
        url: '/api/srm/channel/resolve',
        method: 'GET',
        params
    })
}

/**通道分页列表**/
export function httpBaseSrmColumnChannel(data: Omix) {
    return request({
        url: '/api/srm/channel/column',
        method: 'POST',
        data
    })
}

/**通道下拉选项**/
export function httpBaseSrmSelectChannel() {
    return request({
        url: '/api/srm/channel/select',
        method: 'GET'
    })
}

/**通道批量绑定端口**/
export function httpBaseSrmBindChannelPort(data: Omix) {
    return request({
        url: '/api/srm/channel/port/bind',
        method: 'POST',
        data
    })
}

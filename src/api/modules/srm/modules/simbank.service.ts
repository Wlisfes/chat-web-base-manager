import { request } from '@/utils'

/**SIMBANK 设备静态枚举**/
export function httpBaseSrmSimbankEnums() {
    return request({
        url: '/api/srm/simbank/enums',
        method: 'GET'
    })
}

/**新增 SIMBANK 设备**/
export function httpBaseSrmCreateSimbank(data: Omix) {
    return request({
        url: '/api/srm/simbank/create',
        method: 'POST',
        data
    })
}

/**编辑 SIMBANK 设备**/
export function httpBaseSrmUpdateSimbank(data: Omix) {
    return request({
        url: '/api/srm/simbank/update',
        method: 'POST',
        data
    })
}

/**修改 SIMBANK 设备状态**/
export function httpBaseSrmSimbankStatusUpdate(data: Omix) {
    return request({
        url: '/api/srm/simbank/status/update',
        method: 'POST',
        data
    })
}

/**查询 SIMBANK 设备分页列表**/
export function httpBaseSrmColumnSimbank(data: Omix) {
    return request({
        url: '/api/srm/simbank/column',
        method: 'POST',
        data
    })
}

/**查询 SIMBANK 设备详情**/
export function httpBaseSrmSimbankResolver(params: Omix) {
    return request({
        url: '/api/srm/simbank/resolve',
        method: 'GET',
        params
    })
}

/**SIMBANK 设备下拉选项**/
export function httpBaseSrmSelectSimbank(params: Omix) {
    return request({
        url: '/api/srm/simbank/select',
        method: 'GET',
        params
    })
}

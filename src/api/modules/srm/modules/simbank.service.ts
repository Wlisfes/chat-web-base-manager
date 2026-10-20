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

/**SIMBANK 端口静态枚举**/
export function httpBaseSrmSimbankPortEnums() {
    return request({
        url: '/api/srm/simbank/port/enums',
        method: 'GET'
    })
}

/**查询 SIMBANK 端口分页列表**/
export function httpBaseSrmColumnSimbankPort(data: Omix) {
    return request({
        url: '/api/srm/simbank/port/column',
        method: 'POST',
        data
    })
}

/**修改 SIMBANK 端口状态**/
export function httpBaseSrmSimbankPortStatusUpdate(data: Omix) {
    return request({
        url: '/api/srm/simbank/port/status/update',
        method: 'POST',
        data
    })
}

/**随机生成插卡模拟数据**/
export function httpBaseSrmSimbankPortFaker(params: Omix) {
    return request({
        url: '/api/srm/simbank/port/faker',
        method: 'GET',
        params
    })
}

/**插入 SIM 卡**/
export function httpBaseSrmSimbankPortInsert(data: Omix) {
    return request({
        url: '/api/srm/simbank/port/insert',
        method: 'POST',
        data
    })
}

/**激活 SIM 卡**/
export function httpBaseSrmSimbankPortActivate(data: Omix) {
    return request({
        url: '/api/srm/simbank/port/activate',
        method: 'POST',
        data
    })
}

/**拔出 SIM 卡**/
export function httpBaseSrmSimbankPortRemove(data: Omix) {
    return request({
        url: '/api/srm/simbank/port/remove',
        method: 'POST',
        data
    })
}

/**释放已激活端口**/
export function httpBaseSrmSimbankPortRelease(data: Omix) {
    return request({
        url: '/api/srm/simbank/port/release',
        method: 'POST',
        data
    })
}

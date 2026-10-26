import { request } from '@/utils'

/**短信基础价格详情**/
export function httpBaseFinanceFrozenSmsResolver(params: Omix) {
    return request({
        url: '/api/finance/frozen/sms/resolve',
        method: 'GET',
        params
    })
}

/**新增短信基础价格**/
export function httpBaseFinanceCreateFrozenSms(data: Omix) {
    return request({
        url: '/api/finance/frozen/sms/create',
        method: 'POST',
        data
    })
}

/**编辑短信基础价格**/
export function httpBaseFinanceUpdateFrozenSms(data: Omix) {
    return request({
        url: '/api/finance/frozen/sms/update',
        method: 'POST',
        data
    })
}

/**短信基础价格静态枚举**/
export function httpBaseFinanceFrozenSmsEnums() {
    return request({
        url: '/api/finance/frozen/sms/enums',
        method: 'GET'
    })
}

/**批量上调、下调短信基础价格**/
export function httpBaseFinanceFluctuateFrozenSms(data: Omix) {
    return request({
        url: '/api/finance/frozen/sms/fluctuate',
        method: 'POST',
        data
    })
}

/**短信基础价格分页列表**/
export function httpBaseFinanceColumnFrozenSms(data: Omix) {
    return request({
        url: '/api/finance/frozen/sms/column',
        method: 'POST',
        data
    })
}

/**simbank 基础成本价格详情**/
export function httpBaseFinanceFrozenSimbankResolver(params: Omix) {
    return request({
        url: '/api/finance/frozen/simbank/resolve',
        method: 'GET',
        params
    })
}

/**新增simbank 基础成本价格**/
export function httpBaseFinanceCreateFrozenSimbank(data: Omix) {
    return request({
        url: '/api/finance/frozen/simbank/create',
        method: 'POST',
        data
    })
}

/**编辑simbank 基础成本价格**/
export function httpBaseFinanceUpdateFrozenSimbank(data: Omix) {
    return request({
        url: '/api/finance/frozen/simbank/update',
        method: 'POST',
        data
    })
}

/**simbank 基础成本价格静态枚举**/
export function httpBaseFinanceFrozenSimbankEnums() {
    return request({
        url: '/api/finance/frozen/simbank/enums',
        method: 'GET'
    })
}

/**批量上调、下调simbank 基础成本价格**/
export function httpBaseFinanceFluctuateFrozenSimbank(data: Omix) {
    return request({
        url: '/api/finance/frozen/simbank/fluctuate',
        method: 'POST',
        data
    })
}

/**simbank 基础成本价格分页列表**/
export function httpBaseFinanceColumnFrozenSimbank(data: Omix) {
    return request({
        url: '/api/finance/frozen/simbank/column',
        method: 'POST',
        data
    })
}

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

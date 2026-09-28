import { request } from '@/utils'

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

/**短信基础价格分页列表**/
export function httpBaseFinanceColumnFrozenSms(data: Omix) {
    return request({
        url: '/api/finance/frozen/sms/column',
        method: 'POST',
        data
    })
}

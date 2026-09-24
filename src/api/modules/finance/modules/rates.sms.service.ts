import { request } from '@/utils'

/**新增短信基础价格**/
export function httpBaseFinanceCreateBasicSmsRate(data: Omix) {
    return request({
        url: '/api/finance/rates/sms/create',
        method: 'POST',
        data
    })
}

/**编辑短信基础价格**/
export function httpBaseFinanceUpdateBasicSmsRate(data: Omix) {
    return request({
        url: '/api/finance/rates/sms/update',
        method: 'POST',
        data
    })
}

/**短信基础价格分页列表**/
export function httpBaseFinanceColumnBasicSmsRate(data: Omix) {
    return request({
        url: '/api/finance/rates/sms/column',
        method: 'POST',
        data
    })
}

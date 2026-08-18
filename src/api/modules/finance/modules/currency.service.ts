import { request } from '@/utils'

/**币种分页列表**/
export function httpBaseFinanceColumnCurrency(data: Omix) {
    return request({
        url: `/api/finance/currency/column`,
        method: 'POST',
        data
    })
}

/**币种状态修改**/
export function httpBaseFinanceUpdateCurrencyStatus(data: Omix) {
    return request({
        url: `/api/finance/currency/update/status`,
        method: 'POST',
        data
    })
}

/**币种下拉列表**/
export function httpBaseFinanceSelectCurrency() {
    return request({
        url: `/api/finance/currency/select`,
        method: 'POST'
    })
}

/**汇率分页列表**/
export function httpBaseFinanceColumnCurrencyExchange(data: Omix) {
    return request({
        url: `/api/finance/currency/exchange/column`,
        method: 'POST',
        data
    })
}

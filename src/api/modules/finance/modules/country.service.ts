import { request } from '@/utils'

/**国家/地区静态枚举**/
export function httpBaseFinanceCountryEnums() {
    return request({
        url: '/api/finance/country/enums',
        method: 'GET'
    })
}

/**国家/地区分页列表**/
export function httpBaseFinanceColumnCountry(data: Omix) {
    return request({
        url: `/api/finance/country/column`,
        method: 'POST',
        data
    })
}

/**国家/地区状态修改**/
export function httpBaseFinanceUpdateCountryStatus(data: Omix) {
    return request({
        url: `/api/finance/country/update/status`,
        method: 'POST',
        data
    })
}

/**国家/地区下拉列表**/
export function httpBaseFinanceSelectCountry() {
    return request({
        url: `/api/finance/country/select`,
        method: 'POST'
    })
}

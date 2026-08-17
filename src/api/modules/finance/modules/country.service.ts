import { request } from '@/utils'

/**国家/地区分页列表**/
export function httpBaseFinanceColumnCountry(data: Omix) {
    return request({
        url: `/api/windows/finance/country/column`,
        method: 'POST',
        data
    })
}

/**国家/地区状态修改**/
export function httpBaseFinanceUpdateCountryStatus(data: Omix) {
    return request({
        url: `/api/windows/finance/country/update/status`,
        method: 'POST',
        data
    })
}

/**国家/地区下拉列表**/
export function httpBaseFinanceSelectCountry() {
    return request({
        url: `/api/windows/finance/country/select`,
        method: 'POST'
    })
}

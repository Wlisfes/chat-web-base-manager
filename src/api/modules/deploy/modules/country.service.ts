import { request } from '@/utils'

/**国家/地区静态枚举：国家/地区基础数据由 Skyline 服务维护**/
export function httpBaseSkylineCountryEnums() {
    return request({
        url: '/api/skyline/deploy/country/enums',
        method: 'GET'
    })
}

/**国家/地区分页列表**/
export function httpBaseSkylineColumnCountry(data: Omix) {
    return request({
        url: `/api/skyline/deploy/country/column`,
        method: 'POST',
        data
    })
}

/**国家/地区状态修改**/
export function httpBaseSkylineCountryStatusUpdate(data: Omix) {
    return request({
        url: `/api/skyline/deploy/country/status/update`,
        method: 'POST',
        data
    })
}

/**国家/地区下拉列表**/
export function httpBaseSkylineSelectCountry() {
    return request({
        url: `/api/skyline/deploy/country/select`,
        method: 'POST'
    })
}
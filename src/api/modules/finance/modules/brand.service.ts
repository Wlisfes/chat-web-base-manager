import { request } from '@/utils'

/**新增品牌**/
export function httpBaseFinanceCreateBrand(data: Omix) {
    return request({
        url: `/api/finance/brand/create`,
        method: 'POST',
        data
    })
}

/**编辑品牌**/
export function httpBaseFinanceUpdateBrand(data: Omix) {
    return request({
        url: `/api/finance/brand/update`,
        method: 'POST',
        data
    })
}

/**品牌分页列表**/
export function httpBaseFinanceColumnBrand(data: Omix) {
    return request({
        url: `/api/finance/brand/column`,
        method: 'POST',
        data
    })
}

/**品牌状态修改**/
export function httpBaseFinanceUpdateBrandStatus(data: Omix) {
    return request({
        url: `/api/finance/brand/update/status`,
        method: 'POST',
        data
    })
}

/**品牌下拉列表**/
export function httpBaseFinanceSelectBrand() {
    return request({
        url: `/api/finance/brand/select`,
        method: 'POST'
    })
}

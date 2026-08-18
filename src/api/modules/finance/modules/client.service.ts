import { request } from '@/utils'

/**新增客户**/
export function httpBaseFinanceCreateClient(data: Omix) {
    return request({
        url: `/api/finance/client/create`,
        method: 'POST',
        data
    })
}

/**编辑客户**/
export function httpBaseFinanceUpdateClient(data: Omix) {
    return request({
        url: `/api/finance/client/update`,
        method: 'POST',
        data
    })
}

/**客户分页列表**/
export function httpBaseFinanceColumnClient(data: Omix) {
    return request({
        url: `/api/finance/client/column`,
        method: 'POST',
        data
    })
}

/**客户状态修改**/
export function httpBaseFinanceUpdateClientStatus(data: Omix) {
    return request({
        url: `/api/finance/client/update/status`,
        method: 'POST',
        data
    })
}

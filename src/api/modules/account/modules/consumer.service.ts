import { request } from '@/utils'

const CONSUMER_API = '/api/account/consumer'

/** 新增外部客户。 */
export function httpBaseAccountCreateConsumer(data: Omix) {
    return request({ url: `${CONSUMER_API}/create`, method: 'POST', data })
}

/** 编辑外部客户。 */
export function httpBaseAccountUpdateConsumer(data: Omix) {
    return request({ url: `${CONSUMER_API}/update`, method: 'POST', data })
}

/** 查询外部客户分页列表。 */
export function httpBaseAccountColumnConsumer(data: Omix) {
    return request({ url: `${CONSUMER_API}/column`, method: 'POST', data })
}

/** 修改外部客户状态。 */
export function httpBaseAccountUpdateConsumerStatus(data: Omix) {
    return request({ url: `${CONSUMER_API}/update/status`, method: 'POST', data })
}

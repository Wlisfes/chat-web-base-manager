import { request } from '@/utils'
import type * as Position from '@/interface/deploy/deploy-position.resolver'

/**新增职位**/
export function httpBaseAccountCreatePosition(data: Position.PositionCreateRequest) {
    return request<Position.PositionItem>({
        url: '/api/account/position/create',
        method: 'POST',
        data
    })
}

/**编辑职位**/
export function httpBaseAccountUpdatePosition(data: Position.PositionUpdateRequest) {
    return request<Position.PositionItem>({
        url: '/api/account/position/update',
        method: 'POST',
        data
    })
}

/**获取职位详情**/
export function httpBaseAccountPositionResolver(params: Position.PositionResolverRequest) {
    return request<Position.PositionItem>({
        url: '/api/account/position/resolve',
        method: 'GET',
        params
    })
}

/**分页查询职位**/
export function httpBaseAccountColumnPosition(data: Position.PositionColumnRequest) {
    return request<Position.PositionColumnResponse>({
        url: '/api/account/position/column',
        method: 'POST',
        data
    })
}

/**删除未关联员工的职位**/
export function httpBaseAccountDeletePosition(data: Position.PositionKeyRequest) {
    return request<Position.PositionDeleteResponse>({ url: '/api/account/position/delete', method: 'POST', data })
}

/**获取职位下拉选项**/
export function httpBaseAccountSelectPosition(params?: Position.PositionSelectRequest) {
    return request<Position.PositionSelectItem[]>({
        url: '/api/account/position/select',
        method: 'GET',
        ...(params ? { params } : {})
    })
}

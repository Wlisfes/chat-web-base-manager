import { request } from '@/utils'
import type * as Position from '@/interface/deploy/deploy-position.resolver'

/**新增职位**/
export function httpBaseSystemCreatePosition(data: Position.PositionCreateRequest) {
    return request<Position.PositionItem>({
        url: '/api/account/position/create',
        method: 'POST',
        data
    })
}

/**编辑职位**/
export function httpBaseSystemUpdatePosition(data: Position.PositionUpdateRequest) {
    return request<Position.PositionItem>({
        url: '/api/account/position/update',
        method: 'POST',
        data
    })
}

/**职位详情**/
export function httpBaseSystemPositionResolver(params: Position.PositionResolverRequest) {
    return request<Position.PositionItem>({
        url: '/api/account/position/resolver',
        method: 'GET',
        params
    })
}

/**职位分页列表查询**/
export function httpBaseSystemColumnPosition(data: Position.PositionColumnRequest) {
    return request<Position.PositionColumnResponse>({
        url: '/api/account/position/column',
        method: 'POST',
        data
    })
}

/**删除职位**/
export function httpBaseSystemDeletePosition(data: Position.PositionKeyRequest) {
    return request<Position.PositionDeleteResponse>({ url: '/api/account/position/delete', method: 'POST', data })
}

/**职位下拉列表**/
export function httpBaseSystemSelectPosition(params?: Position.PositionSelectRequest) {
    return request<Position.PositionSelectItem[]>({
        url: '/api/account/position/select',
        method: 'GET',
        ...(params ? { params } : {})
    })
}

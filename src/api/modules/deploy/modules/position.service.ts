import { request } from '@/utils'

/**新增职位**/
export function httpBaseSystemCreatePosition(data: Omix) {
    return request({
        url: `/api/windows/deploy/position/create`,
        method: 'POST',
        data
    })
}

/**编辑职位**/
export function httpBaseSystemUpdatePosition(data: Omix) {
    return request({
        url: `/api/windows/deploy/position/update`,
        method: 'POST',
        data
    })
}

/**职位详情**/
export function httpBaseSystemPositionResolver(data: Omix) {
    return request({
        url: `/api/windows/deploy/position/resolver`,
        method: 'POST',
        data
    })
}

/**职位分页列表查询**/
export function httpBaseSystemColumnPosition(data: Omix) {
    return request({
        url: `/api/windows/deploy/position/column`,
        method: 'POST',
        data
    })
}

/**删除职位**/
export function httpBaseSystemDeletePosition(data: Omix) {
    return request({
        url: `/api/windows/deploy/position/delete`,
        method: 'POST',
        data
    })
}

/**职位下拉列表**/
export function httpBaseSystemSelectPosition() {
    return request({
        url: `/api/windows/deploy/position/select`,
        method: 'POST'
    })
}

/**职级下拉列表**/
export function httpBaseSystemSelectRank() {
    return request({
        url: `/api/windows/deploy/position/rank/select`,
        method: 'POST'
    })
}

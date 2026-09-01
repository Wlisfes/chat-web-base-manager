/**职位列表项。*/
export interface PositionItem {
    keyId: number
    name: string
    sort: number
    accountCount: number
    createTime?: string | Date | null
    modifyTime?: string | Date | null
}

/**新增职位请求体。*/
export interface PositionCreateRequest {
    name: string
    sort?: number
}

/**更新职位请求体。*/
export interface PositionUpdateRequest extends PositionCreateRequest {
    keyId: number
}

/**职位详情查询参数。*/
export interface PositionResolverRequest {
    keyId: number
}

/**职位分页查询请求体。*/
export interface PositionColumnRequest {
    page: number
    size: number
    name?: string
}

/**职位主键请求体。*/
export interface PositionKeyRequest {
    keyId: number
}

/**职位下拉选项。*/
export interface PositionSelectItem {
    keyId: number
    name: string
}

/**职位下拉查询参数。*/
export interface PositionSelectRequest {
    name?: string
}

/**职位分页响应数据。*/
export interface PositionColumnResponse {
    page: number
    size: number
    total: number
    list: PositionItem[]
}

/**职位删除响应数据。*/
export interface PositionDeleteResponse {
    success: boolean
}

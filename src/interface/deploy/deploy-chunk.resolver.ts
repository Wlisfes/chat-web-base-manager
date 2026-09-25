/**枚举所属模块。*/
export type ChunkModule = 'CHUNK_SYSTEM' | 'CHUNK_CRM' | 'CHUNK_SRM'

/**枚举项状态。*/
export type ChunkStatus = 'enable' | 'disable'

/**枚举字段类型。*/
export type ChunkKind = 'select' | 'tree'

/**枚举下拉选项。*/
export interface ChunkEnumOption<T extends string = string> {
    value: T
    label: string
    description: string
    type: string
}

/**系统枚举静态枚举响应数据。*/
export interface ChunkEnumsResponse {
    moduleOptions: ChunkEnumOption<ChunkModule>[]
    kindOptions: ChunkEnumOption<ChunkKind>[]
    statusOptions: ChunkEnumOption<ChunkStatus>[]
}

/**系统枚举分类列表项。*/
export interface ChunkModuleItem {
    keyId: number
    module: ChunkModule
    type: string
    name: string
    kind: ChunkKind
    remark?: string | null
    allowDelete: boolean
    allowUpdate: boolean
    createBy?: string | null
    modifyBy?: string | null
    createTime?: string | Date | null
    modifyTime?: string | Date | null
}

/**系统枚举分类分页查询请求体。*/
export interface ChunkModuleColumnRequest extends Omix {
    page: number
    size: number
    module?: ChunkModule
    name?: string
    kind?: ChunkKind
}

/**系统枚举分类分页响应数据。*/
export interface ChunkModuleColumnResponse {
    page: number
    size: number
    total: number
    list: ChunkModuleItem[]
}

/**系统枚举列表项。*/
export interface ChunkItem {
    keyId: number
    pid: number | null
    module: ChunkModule
    type: string
    name: string
    value: string
    json: Record<string, unknown> | null
    sort: number
    status: ChunkStatus
    allowDelete: boolean
    allowUpdate: boolean
    createTime?: string | Date | null
    modifyTime?: string | Date | null
}

/**系统枚举分页查询请求体。*/
export interface ChunkColumnRequest extends Omix {
    page: number
    size: number
    module?: ChunkModule
    type?: string
    name?: string
    status?: ChunkStatus
    pid?: number
}

/**系统枚举分页响应数据。*/
export interface ChunkColumnResponse {
    page: number
    size: number
    total: number
    list: ChunkItem[]
}

/**系统枚举主键请求体。*/
export interface ChunkKeyRequest {
    keyId: number
}

/**新增系统枚举请求体。*/
export interface ChunkCreateRequest {
    pid?: number | null
    module: ChunkModule
    type: string
    name: string
    value: string
    json?: Record<string, unknown> | null
    sort: number
    status: ChunkStatus
    allowDelete: boolean
    allowUpdate: boolean
}

/**更新系统枚举请求体。*/
export interface ChunkUpdateRequest extends Partial<ChunkCreateRequest> {
    keyId: number
}

/**系统枚举删除响应数据。*/
export interface ChunkDeleteResponse {
    success: boolean
}

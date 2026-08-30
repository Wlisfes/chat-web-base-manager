/**菜单节点类型。*/
export type SheetNodeType = 'directory' | 'menu' | 'button'

/**菜单节点状态。*/
export type SheetNodeStatus = 'enabled' | 'disabled'

/**账号服务返回的菜单节点。*/
export interface SheetNode extends Omix {
    keyId: number
    parentKeyId: number | null
    type: SheetNodeType
    name: string
    routeName?: string | null
    path?: string | null
    component?: string | null
    permissionCode?: string | null
    icon?: string | null
    externalUrl?: string | null
    sort: number
    visible: boolean
    keepAlive: boolean
    status: SheetNodeStatus
    createTime?: string | Date | null
    modifyTime?: string | Date | null
    children?: SheetNode[]
}

/**新增菜单节点请求体。*/
export interface SheetCreateRequest extends Omix {
    parentKeyId?: number | null
    type: SheetNodeType
    name: string
    routeName?: string | null
    path?: string | null
    component?: string | null
    permissionCode?: string | null
    icon?: string | null
    externalUrl?: string | null
    sort: number
    visible: boolean
    keepAlive: boolean
    status: SheetNodeStatus
}

/**更新菜单节点请求体。*/
export type SheetUpdateRequest = Partial<SheetCreateRequest> & {
    keyId: number
}

/**菜单主键请求参数。*/
export interface SheetKeyRequest extends Omix {
    keyId: number
}

/**菜单分页查询请求体。*/
export interface SheetColumnRequest extends Omix {
    page: number
    pageSize: number
    parentKeyId?: number | null
    name?: string
    permissionCode?: string
    path?: string
}

/**菜单分页查询响应数据。*/
export interface SheetColumnResponse extends Omix {
    items: SheetNode[]
    total: number
    page: number
    pageSize: number
}

/**菜单删除响应数据。*/
export interface SheetDeleteResponse extends Omix {
    success: boolean
}

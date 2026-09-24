import { request } from '@/utils'
import * as env from '@/interface/instance.resolver'

/**创建目录、菜单或按钮节点**/
export function httpBaseAccountCreateSheet(data: env.SheetCreateRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/create',
        method: 'POST',
        data
    })
}

/**更新或移动菜单节点**/
export function httpBaseAccountUpdateSheet(data: env.SheetUpdateRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/update',
        method: 'POST',
        data
    })
}

/**按父菜单分页查询一级及直接下级节点**/
export function httpBaseAccountColumnSheet(data: env.SheetColumnRequest) {
    return request<env.SheetColumnResponse>({
        url: '/api/account/sheet/column',
        method: 'POST',
        data
    })
}

/**获取菜单类型、状态和显示状态枚举**/
export function httpBaseAccountSheetEnums() {
    return request({
        url: '/api/account/sheet/enums',
        method: 'GET'
    })
}

/**获取完整菜单树**/
export function httpBaseAccountSheetTree() {
    return request<Array<env.SheetNode>>({
        url: '/api/account/sheet/tree/structure',
        method: 'GET'
    })
}

/**获取菜单详情**/
export function httpBaseAccountSheetResolver(data: env.SheetKeyRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/resolve',
        method: 'GET',
        params: data
    })
}

/**删除没有下级和角色引用的菜单节点**/
export function httpBaseAccountDeleteSheet(data: env.SheetKeyRequest) {
    return request<env.SheetDeleteResponse>({
        url: '/api/account/sheet/delete',
        method: 'POST',
        data
    })
}

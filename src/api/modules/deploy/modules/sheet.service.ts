import { request } from '@/utils'
import * as env from '@/interface/instance.resolver'

/**新增菜单资源。*/
export function httpBaseSystemCreateSheetResource(data: env.SheetCreateRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/create',
        method: 'POST',
        data
    })
}

/**编辑菜单资源。*/
export function httpBaseSystemUpdateSheetResource(data: env.SheetUpdateRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/update',
        method: 'POST',
        data
    })
}

/**菜单分页列表。*/
export function httpBaseSystemColumnSheet(data: env.SheetColumnRequest) {
    return request<env.SheetColumnResponse>({
        url: '/api/account/sheet/column',
        method: 'POST',
        data
    })
}

/**菜单树结构。*/
export function httpBaseSystemSheetTreeStructure() {
    return request<Array<env.SheetNode>>({
        url: '/api/account/sheet/tree/structure',
        method: 'GET'
    })
}

/**菜单或按钮详情。*/
export function httpBaseSystemSheetResolver(data: env.SheetKeyRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/resolver',
        method: 'GET',
        params: data
    })
}

/**新增权限按钮。*/
export function httpBaseSystemCreateSheetAuthorize(data: env.SheetCreateRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/create',
        method: 'POST',
        data
    })
}

/**编辑权限按钮。*/
export function httpBaseSystemUpdateSheetAuthorize(data: env.SheetUpdateRequest) {
    return request<env.SheetNode>({
        url: '/api/account/sheet/update',
        method: 'POST',
        data
    })
}

/**删除菜单或按钮。*/
export function httpBaseSystemDeleteSheet(data: env.SheetKeyRequest) {
    return request<env.SheetDeleteResponse>({
        url: '/api/account/sheet/delete',
        method: 'POST',
        data
    })
}

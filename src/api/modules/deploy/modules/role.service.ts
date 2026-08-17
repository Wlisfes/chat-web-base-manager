import { request } from '@/utils'

/**新增岗位角色**/
export function httpBaseSystemCreateRole(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/create`,
        method: 'POST',
        data
    })
}

/**编辑岗位角色**/
export function httpBaseSystemUpdateRole(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/update`,
        method: 'POST',
        data
    })
}

/**角色详情**/
export function httpBaseSystemRoleResolver(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/resolver`,
        method: 'POST',
        data
    })
}

/**角色列表查询**/
export function httpBaseSystemColumnRole(data?: Omix) {
    return request({
        url: `/api/windows/deploy/role/column`,
        method: 'POST',
        data
    })
}

/**角色关联账号列表**/
export function httpBaseSystemColumnAccountRole(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/account/column`,
        method: 'POST',
        data
    })
}

/**角色关联用户**/
export function httpBaseSystemCreateAccountRole(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/account/create`,
        method: 'POST',
        data
    })
}

/**删除角色关联用户**/
export function httpBaseSystemDeleteAccountRole(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/account/delete`,
        method: 'POST',
        data
    })
}

/**角色菜单权限列表**/
export function httpBaseSystemColumnRoleSheet(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/sheet/column`,
        method: 'POST',
        data
    })
}

/**更新角色菜单权限**/
export function httpBaseSystemUpdateRoleSheet(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/sheet/update`,
        method: 'POST',
        data
    })
}

/**更新角色数据权限**/
export function httpBaseSystemUpdateRoleModel(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/model/update`,
        method: 'POST',
        data
    })
}

/**删除岗位角色**/
export function httpBaseSystemDeleteRole(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/delete`,
        method: 'POST',
        data
    })
}

/**批量更新角色排序**/
export function httpBaseSystemUpdateRoleSort(data: Omix) {
    return request({
        url: `/api/windows/deploy/role/sort/update`,
        method: 'POST',
        data
    })
}

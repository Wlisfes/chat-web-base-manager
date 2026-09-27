import { request } from '@/utils'

/**获取角色状态、数据范围类型和数据范围状态枚举**/
export function httpBaseAccountRoleEnums() {
    return request({
        url: '/api/account/role/enums',
        method: 'GET'
    })
}

/**获取通用角色列表和岗位角色树**/
export function httpBaseAccountRoleConfiger() {
    return request({
        url: '/api/account/role/configer',
        method: 'GET'
    })
}

/**获取角色、菜单和数据范围详情**/
export function httpBaseAccountRoleResolver(params: Omix) {
    return request({
        url: '/api/account/role/resolve',
        method: 'GET',
        params
    })
}

/**创建角色**/
export function httpBaseAccountCreateRole(data: Omix) {
    return request({
        url: '/api/account/role/create',
        method: 'POST',
        data
    })
}

/**更新角色**/
export function httpBaseAccountUpdateRole(data: Omix) {
    return request({
        url: '/api/account/role/update',
        method: 'POST',
        data
    })
}

/**删除未分配用户的非内置角色**/
export function httpBaseAccountDeleteRole(data: Omix) {
    return request({
        url: '/api/account/role/delete',
        method: 'POST',
        data
    })
}

/**替换角色的全部菜单和按钮权限**/
export function httpBaseAccountUpdateRoleMenu(data: Omix) {
    return request({
        url: '/api/account/role/update/menu',
        method: 'POST',
        data
    })
}

/**替换角色的全部资源数据范围**/
export function httpBaseAccountUpdateRoleDataScope(data: Omix) {
    return request({
        url: '/api/account/role/update/data/scope',
        method: 'POST',
        data
    })
}

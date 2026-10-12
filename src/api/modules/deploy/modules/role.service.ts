import { request } from '@/utils'

/**获取角色状态、数据范围类型和数据范围状态枚举**/
export function httpBaseSkylineRoleEnums() {
    return request({
        url: '/api/skyline/deploy/role/enums',
        method: 'GET'
    })
}

/**获取通用角色列表和岗位角色树**/
export function httpBaseSkylineRoleConfiger() {
    return request({
        url: '/api/skyline/deploy/role/configer',
        method: 'GET'
    })
}

/**获取角色、菜单和数据范围详情**/
export function httpBaseSkylineRoleResolver(params: Omix) {
    return request({
        url: '/api/skyline/deploy/role/resolve',
        method: 'GET',
        params
    })
}

/**创建角色**/
export function httpBaseSkylineCreateRole(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/create',
        method: 'POST',
        data
    })
}

/**更新角色**/
export function httpBaseSkylineUpdateRole(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/update',
        method: 'POST',
        data
    })
}

/**批量更新角色排序**/
export function httpBaseSkylineUpdateRoleSort(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/sort/update',
        method: 'POST',
        data
    })
}

/**删除未分配用户的非内置角色**/
export function httpBaseSkylineDeleteRole(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/delete',
        method: 'POST',
        data
    })
}

/**批量关联角色用户**/
export function httpBaseSkylineRoleLinkUser(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/link/user',
        method: 'POST',
        data
    })
}

/**批量移除角色用户**/
export function httpBaseSkylineRoleUnlinkUser(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/unlink/user',
        method: 'POST',
        data
    })
}

/**替换角色的全部菜单和按钮权限**/
export function httpBaseSkylineUpdateRoleSheet(data: Omix) {
    return request({
        url: '/api/skyline/deploy/role/update/sheet',
        method: 'POST',
        data
    })
}

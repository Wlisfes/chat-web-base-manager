import { request } from '@/utils'

const ROLE_API = '/api/account/role'
const USER_API = '/api/account/user'

/**新增岗位角色**/
export function httpBaseSystemCreateRole(data: Omix) {
    return request({ url: `${ROLE_API}/create`, method: 'POST', data })
}

/**编辑岗位角色**/
export function httpBaseSystemUpdateRole(data: Omix) {
    return request({
        url: `${ROLE_API}/update`,
        method: 'POST',
        data
    })
}

/**角色详情**/
export function httpBaseSystemRoleResolver(params: Omix) {
    return request({ url: `${ROLE_API}/resolver`, method: 'GET', params })
}

/**角色列表查询**/
export function httpBaseSystemSelectRole() {
    return request({ url: `${ROLE_API}/select`, method: 'GET' })
}

/**角色关联账号列表**/
export function httpBaseSystemColumnAccountRole(data: Omix) {
    return request({
        url: `${USER_API}/column`,
        method: 'POST',
        data
    })
}

/**更新账号角色关系。*/
export function httpBaseSystemUpdateAccountRole(data: Omix) {
    return request({ url: `${USER_API}/update/role`, method: 'POST', data })
}

/**角色菜单权限列表**/
export function httpBaseSystemColumnRoleSheet(params: Omix) {
    return request({ url: `${ROLE_API}/resolver`, method: 'GET', params })
}

/**更新角色菜单权限**/
export function httpBaseSystemUpdateRoleSheet(data: Omix) {
    return request({
        url: `${ROLE_API}/update/menu`,
        method: 'POST',
        data
    })
}

/**更新角色数据权限**/
export function httpBaseSystemUpdateRoleModel(data: Omix) {
    return request({
        url: `${ROLE_API}/update/data/scope`,
        method: 'POST',
        data
    })
}

/**删除岗位角色**/
export function httpBaseSystemDeleteRole(data: Omix) {
    return request({ url: `${ROLE_API}/delete`, method: 'POST', data })
}

/**更新单个角色排序。*/
export function httpBaseSystemUpdateRoleSort(data: Omix) {
    return request({ url: `${ROLE_API}/update`, method: 'POST', data })
}

import { request } from '@/utils'

/**创建组织节点**/
export function httpBaseAccountCreateOrganization(data: Omix) {
    return request({
        url: '/api/account/dept/create',
        method: 'POST',
        data
    })
}

/**更新或移动组织节点**/
export function httpBaseAccountUpdateOrganization(data: Omix) {
    return request({
        url: '/api/account/dept/update',
        method: 'POST',
        data
    })
}

/**获取组织详情**/
export function httpBaseAccountOrganizationResolver(params: Omix) {
    return request({
        url: '/api/account/dept/resolve',
        method: 'GET',
        params
    })
}

/**获取组织类型和状态枚举**/
export function httpBaseAccountOrganizationEnums(params: Omix = {}) {
    return request({
        url: '/api/account/dept/enums',
        method: 'GET',
        params
    })
}

/**获取完整组织树**/
export function httpBaseAccountOrganizationTreeStructure(params: Omix = {}) {
    return request({
        url: '/api/account/dept/tree/structure',
        method: 'GET',
        params
    })
}

/**获取带启用成员的完整组织树**/
export function httpBaseAccountOrganizationTreeUser() {
    return request({
        url: '/api/account/dept/tree/user',
        method: 'GET'
    })
}

/**删除没有下级、成员和权限引用的组织节点**/
export function httpBaseAccountDeleteOrganization(data: Omix) {
    return request({
        url: '/api/account/dept/delete',
        method: 'POST',
        data
    })
}

/**按组织主键获取该组织的直接启用成员**/
export function httpBaseAccountOrganizationColumnUser(params: Omix) {
    return request({
        url: '/api/account/dept/column/user',
        method: 'GET',
        params
    })
}

/**按账号UID全集同步组织成员**/
export function httpBaseAccountUpdateOrganizationUser(data: Omix) {
    return request({
        url: '/api/account/dept/update/user',
        method: 'POST',
        data
    })
}

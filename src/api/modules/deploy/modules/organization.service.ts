import { request } from '@/utils'

/**创建组织节点**/
export function httpBaseSkylineCreateOrganization(data: Omix) {
    return request({
        url: '/api/skyline/deploy/organization/create',
        method: 'POST',
        data
    })
}

/**更新或移动组织节点**/
export function httpBaseSkylineUpdateOrganization(data: Omix) {
    return request({
        url: '/api/skyline/deploy/organization/update',
        method: 'POST',
        data
    })
}

/**获取组织详情**/
export function httpBaseSkylineOrganizationResolver(params: Omix) {
    return request({
        url: '/api/skyline/deploy/organization/resolve',
        method: 'GET',
        params
    })
}

/**获取组织类型和状态枚举**/
export function httpBaseSkylineOrganizationEnums(params: Omix = {}) {
    return request({
        url: '/api/skyline/deploy/organization/enums',
        method: 'GET',
        params
    })
}

/**获取完整组织树**/
export function httpBaseSkylineOrganizationTreeStructure(params: Omix = {}) {
    return request({
        url: '/api/skyline/deploy/organization/tree/structure',
        method: 'GET',
        params
    })
}

/**获取带启用成员的完整组织树**/
export function httpBaseSkylineOrganizationTreeUser() {
    return request({
        url: '/api/skyline/deploy/organization/tree/user',
        method: 'GET'
    })
}

/**删除没有下级、成员和权限引用的组织节点**/
export function httpBaseSkylineDeleteOrganization(data: Omix) {
    return request({
        url: '/api/skyline/deploy/organization/delete',
        method: 'POST',
        data
    })
}

/**按组织主键获取该组织的直接启用成员**/
export function httpBaseSkylineOrganizationColumnUser(params: Omix) {
    return request({
        url: '/api/skyline/deploy/organization/column/user',
        method: 'GET',
        params
    })
}

/**按账号UID全集同步组织成员**/
export function httpBaseSkylineUpdateOrganizationUser(data: Omix) {
    return request({
        url: '/api/skyline/deploy/organization/update/user',
        method: 'POST',
        data
    })
}

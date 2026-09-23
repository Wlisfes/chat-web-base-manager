import { request } from '@/utils'

/**创建组织节点**/
export function httpBaseAccountCreateOrganization(data: Omix) {
    return request({ url: '/api/account/dept/create', method: 'POST', data })
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
    return request({ url: '/api/account/dept/resolve', method: 'GET', params })
}

/**获取组织类型和状态枚举**/
export function httpBaseAccountOrganizationEnums(params: Omix = {}) {
    return request({ url: '/api/account/dept/enums', method: 'GET', params })
}

/**获取完整组织树**/
export function httpBaseAccountOrganizationTreeStructure() {
    return request({ url: '/api/account/dept/tree/structure', method: 'GET' })
}

/**获取带启用成员的完整组织树**/
export function httpBaseAccountOrganizationTreeUser() {
    return request({ url: '/api/account/dept/tree/user', method: 'GET' })
}

/**删除没有下级、成员和权限引用的组织节点**/
export function httpBaseAccountDeleteOrganization(data: Omix) {
    return request({ url: '/api/account/dept/delete', method: 'POST', data })
}

/**批量把账号加入指定组织**/
export function httpBaseAccountUpdateOrganizationUser(data: Omix) {
    return request({ url: '/api/account/dept/update/user', method: 'POST', data })
}

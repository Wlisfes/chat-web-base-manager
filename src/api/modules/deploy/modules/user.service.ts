import { request } from '@/utils'

/**创建账号并可原子设置组织和角色**/
export function httpBaseSkylineCreateUser(data: Omix) {
    return request({
        url: '/api/skyline/deploy/user/create',
        method: 'POST',
        data
    })
}

/**按当前用户的数据范围分页查询账号**/
export function httpBaseSkylineColumnUser(data: Omix) {
    return request({
        url: '/api/skyline/deploy/user/column',
        method: 'POST',
        data
    })
}

/**获取账号下拉选项**/
export function httpBaseSkylineSelectUser() {
    return request({
        url: '/api/skyline/deploy/user/select',
        method: 'GET'
    })
}

/**获取账号状态、员工状态和组织关系状态枚举**/
export function httpBaseSkylineUserEnums() {
    return request({
        url: '/api/skyline/deploy/user/enums',
        method: 'GET'
    })
}

/**按当前用户的数据范围获取账号详情**/
export function httpBaseSkylineUserResolver(params: Omix) {
    return request({
        url: '/api/skyline/deploy/user/resolve',
        method: 'GET',
        params
    })
}

/**按当前用户的数据范围更新账号资料和状态**/
export function httpBaseSkylineUpdateUser(data: Omix) {
    return request({
        url: '/api/skyline/deploy/user/update',
        method: 'POST',
        data
    })
}

/**超级管理员重置账号密码**/
export function httpBaseSkylineResetUserPassword(data: Omix) {
    return request({
        url: '/api/skyline/deploy/user/reset/password',
        method: 'POST',
        data
    })
}

/**替换账号的主组织和兼任组织**/
export function httpBaseSkylineUpdateUserOrganization(data: Omix) {
    return request({
        url: '/api/skyline/deploy/user/update/organization',
        method: 'POST',
        data
    })
}

/**替换账号的全部角色**/
export function httpBaseSkylineUpdateUserRole(data: Omix) {
    return request({
        url: '/api/skyline/deploy/user/update/role',
        method: 'POST',
        data
    })
}

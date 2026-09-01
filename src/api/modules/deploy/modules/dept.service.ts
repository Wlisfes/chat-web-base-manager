import { request } from '@/utils'

/**新增部门**/
export function httpBaseSystemCreateDepartment(data: Omix) {
    return request({ url: '/api/account/dept/create', method: 'POST', data })
}

/**编辑部门**/
export function httpBaseSystemUpdateDepartment(data: Omix) {
    return request({
        url: '/api/account/dept/update',
        method: 'POST',
        data
    })
}

/**部门详情**/
export function httpBaseSystemDepartmentResolver(params: Omix) {
    return request({ url: '/api/account/dept/resolver', method: 'GET', params })
}

/**部门树结构**/
export function httpBaseSystemDepartmentTreeStructure() {
    return request({ url: '/api/account/dept/tree/structure', method: 'GET' })
}

/**删除部门**/
export function httpBaseSystemDeleteDepartment(data: Omix) {
    return request({ url: '/api/account/dept/delete', method: 'POST', data })
}

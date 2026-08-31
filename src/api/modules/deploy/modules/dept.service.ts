import { request } from '@/utils'

const ORGANIZATION_API = '/api/account/organization'

/**新增部门**/
export function httpBaseSystemCreateDepartment(data: Omix) {
    return request({ url: `${ORGANIZATION_API}/create`, method: 'POST', data })
}

/**编辑部门**/
export function httpBaseSystemUpdateDepartment(data: Omix) {
    return request({
        url: `${ORGANIZATION_API}/update`,
        method: 'POST',
        data
    })
}

/**部门详情**/
export function httpBaseSystemDepartmentResolver(params: Omix) {
    return request({ url: `${ORGANIZATION_API}/resolver`, method: 'GET', params })
}

/**部门树结构**/
export function httpBaseSystemDepartmentTreeStructure() {
    return request({ url: `${ORGANIZATION_API}/tree/structure`, method: 'GET' })
}

/**删除部门**/
export function httpBaseSystemDeleteDepartment(data: Omix) {
    return request({ url: `${ORGANIZATION_API}/delete`, method: 'POST', data })
}

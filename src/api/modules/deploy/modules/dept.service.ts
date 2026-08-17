import { request } from '@/utils'

/**新增部门**/
export function httpBaseSystemCreateDepartment(data: Omix) {
    return request({
        url: `/api/windows/deploy/dept/create`,
        method: 'POST',
        data
    })
}

/**编辑部门**/
export function httpBaseSystemUpdateDepartment(data: Omix) {
    return request({
        url: `/api/windows/deploy/dept/update`,
        method: 'POST',
        data
    })
}

/**部门详情**/
export function httpBaseSystemDepartmentResolver(data: Omix) {
    return request({
        url: `/api/windows/deploy/dept/resolver`,
        method: 'POST',
        data
    })
}

/**部门树结构**/
export function httpBaseSystemDepartmentTreeStructure() {
    return request({
        url: `/api/windows/deploy/dept/tree/structure`,
        method: 'POST'
    })
}

/**部门成员列表**/
export function httpBaseSystemDeptMemberOptions(data: Omix) {
    return request({
        url: `/api/windows/deploy/dept/member/options`,
        method: 'POST',
        data
    })
}

/**部门分页列表查询**/
export function httpBaseSystemColumnDepartment(data: Omix) {
    return request({
        url: `/api/windows/deploy/dept/column`,
        method: 'POST',
        data
    })
}

/**删除部门**/
export function httpBaseSystemDeleteDepartment(data: Omix) {
    return request({
        url: `/api/windows/deploy/dept/delete`,
        method: 'POST',
        data
    })
}


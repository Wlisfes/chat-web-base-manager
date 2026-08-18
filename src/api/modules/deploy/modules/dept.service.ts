import { request } from '@/utils'

const ORGANIZATION_API = '/api/organizations'

function mapOrganization(node: Omix): Omix {
    return {
        ...node,
        pid: node.parentKeyId,
        alias: node.code,
        accountCount: node.memberCount ?? 0,
        admin: node.leader,
        subAdmins: [],
        children: (node.children ?? []).map(mapOrganization)
    }
}

function flattenOrganizations(nodes: Array<Omix>): Array<Omix> {
    return nodes.flatMap(node => [node, ...flattenOrganizations(node.children ?? [])])
}

function organizationPayload(data: Omix): Omix {
    return {
        parentKeyId: data.pid ?? data.parentKeyId ?? null,
        code: data.code ?? data.alias,
        name: data.name,
        type: data.type ?? 'department',
        leaderUserUid: data.leaderUserUid ?? data.adminUid ?? null,
        sort: Number(data.sort ?? 10),
        status: data.status ?? 'enabled'
    }
}

/**新增部门**/
export function httpBaseSystemCreateDepartment(data: Omix) {
    return request({ url: ORGANIZATION_API, method: 'POST', data: organizationPayload(data) })
}

/**编辑部门**/
export function httpBaseSystemUpdateDepartment(data: Omix) {
    return request({ url: `${ORGANIZATION_API}/${data.keyId}`, method: 'PATCH', data: organizationPayload(data) })
}

/**部门详情**/
export async function httpBaseSystemDepartmentResolver(data: Omix): Promise<any> {
    const response = await request({ url: `${ORGANIZATION_API}/${data.keyId}`, method: 'GET' })
    return { ...response, data: mapOrganization(response.data) }
}

/**部门树结构**/
export async function httpBaseSystemDepartmentTreeStructure(): Promise<any> {
    const response = await request({ url: `${ORGANIZATION_API}/tree`, method: 'GET' })
    return { ...response, data: { list: (response.data ?? []).map(mapOrganization) } }
}

/**部门成员列表**/
export async function httpBaseSystemDeptMemberOptions(data: Omix): Promise<any> {
    const [organization, users] = await Promise.all([
        request({ url: `${ORGANIZATION_API}/${data.keyId}`, method: 'GET' }),
        request({
            url: '/api/users',
            method: 'GET',
            params: { page: 1, pageSize: 100, organizationKeyIds: String(data.keyId) }
        })
    ])
    const list = (users.data?.items ?? []).map((user: Omix) => ({
        ...user,
        chunk: user.uid === organization.data?.leaderUserUid ? 'admin' : 'member'
    }))
    return { ...users, data: { list, total: users.data?.total ?? list.length } }
}

/**部门分页列表查询**/
export async function httpBaseSystemColumnDepartment(data: Omix): Promise<any> {
    const response = await request({ url: `${ORGANIZATION_API}/tree`, method: 'GET' })
    const mapped = flattenOrganizations((response.data ?? []).map(mapOrganization)).filter(item => {
        if (data.pid !== undefined && data.pid !== null && item.pid !== data.pid) return false
        if (data.name && !item.name?.includes(data.name)) return false
        if (data.alias && !item.alias?.includes(data.alias)) return false
        return true
    })
    const page = Number(data.page ?? 1)
    const size = Number(data.size ?? 50)
    return { ...response, data: { page, size, total: mapped.length, list: mapped.slice((page - 1) * size, page * size) } }
}

/**删除部门**/
export function httpBaseSystemDeleteDepartment(data: Omix) {
    return request({ url: `${ORGANIZATION_API}/${data.keyId}`, method: 'DELETE' })
}

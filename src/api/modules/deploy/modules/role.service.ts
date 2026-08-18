import { request } from '@/utils'

const ROLE_API = '/api/account/roles'
const USER_API = '/api/account/users'
const ORGANIZATION_API = '/api/account/organizations'

function dataScopePayload(data: Omix): Omix {
    if (!data.model) return { rules: [] }
    const organizations = (data.organizationKeyIds ?? []).map((organizationKeyId: number) => ({
        organizationKeyId,
        includeChildren: true
    }))
    return {
        rules: [
            {
                resourceCode: 'account:user',
                scopeType: data.model,
                status: 'enabled',
                ...(data.model === 'custom' ? { organizations } : {})
            }
        ]
    }
}

function rolePayload(data: Omix): Omix {
    return {
        code: data.code ?? `role_${Date.now()}`,
        name: data.name,
        description: data.comment ?? data.description,
        sort: Number(data.sort ?? 10),
        status: data.status ?? 'enabled'
    }
}

function mapRole(role: Omix): Omix {
    const dataScope = (role.dataScopes ?? []).find((item: Omix) => item.resourceCode === 'account:user') ?? role.dataScopes?.[0]
    return {
        ...role,
        comment: role.description,
        chunk: role.builtin ? 'builtin' : 'custom',
        model: dataScope?.scopeType,
        organizationKeyIds: (dataScope?.organizations ?? []).map((item: Omix) => item.organizationKeyId)
    }
}

function getSingleOrganizationKeyId(role: Omix): number | undefined {
    const organizationKeyIds = [
        ...new Set<number>(
            (role.dataScopes ?? [])
                .flatMap((scope: Omix) =>
                    (scope.organizations ?? []).map((organization: Omix) => Number(organization.organizationKeyId))
                )
                .filter((keyId: number) => Number.isSafeInteger(keyId))
        )
    ]
    return organizationKeyIds.length === 1 ? organizationKeyIds[0] : undefined
}

function mapDepartmentRoleTree(nodes: Array<Omix>, rolesByOrganization: Map<number, Omix>): Array<Omix> {
    return nodes.flatMap(organization => {
        const children = mapDepartmentRoleTree(organization.children ?? [], rolesByOrganization)
        const role = rolesByOrganization.get(Number(organization.keyId))
        if (!role && children.length === 0) return []
        return [
            {
                ...organization,
                nodeId: role?.keyId ?? -Number(organization.keyId),
                node: role,
                disabled: !role,
                children
            }
        ]
    })
}

async function replaceUserRole(uid: string, roleId: number, add: boolean) {
    const detail = await request({ url: `${USER_API}/${uid}`, method: 'GET' })
    const current = detail.data?.roleKeyIds ?? []
    const roleKeyIds = add ? [...new Set([...current, roleId])] : current.filter((item: number) => item !== roleId)
    return request({ url: `${USER_API}/${uid}/roles`, method: 'PUT', data: { roleKeyIds } })
}

/**新增岗位角色**/
export async function httpBaseSystemCreateRole(data: Omix): Promise<any> {
    const response = await request({ url: ROLE_API, method: 'POST', data: rolePayload(data) })
    if (data.model) {
        await request({ url: `${ROLE_API}/${response.data.keyId}/data-scopes`, method: 'PUT', data: dataScopePayload(data) })
    }
    return response
}

/**编辑岗位角色**/
export async function httpBaseSystemUpdateRole(data: Omix): Promise<any> {
    const response = await request({ url: `${ROLE_API}/${data.keyId}`, method: 'PATCH', data: rolePayload(data) })
    if (data.model) {
        await request({ url: `${ROLE_API}/${data.keyId}/data-scopes`, method: 'PUT', data: dataScopePayload(data) })
    }
    return response
}

/**角色详情**/
export async function httpBaseSystemRoleResolver(data: Omix): Promise<any> {
    const response = await request({ url: `${ROLE_API}/${data.keyId}`, method: 'GET' })
    return { ...response, data: mapRole(response.data) }
}

/**角色列表查询**/
export async function httpBaseSystemColumnRole(): Promise<any> {
    const [roleResponse, organizationResponse] = await Promise.all([
        request({ url: ROLE_API, method: 'GET' }),
        request({ url: `${ORGANIZATION_API}/tree`, method: 'GET' })
    ])
    const roles = (roleResponse.data ?? []).map(mapRole)
    const rolesByOrganization = new Map<number, Omix>()
    const departmentRoleKeyIds = new Set<number>()
    for (const role of roles) {
        const organizationKeyId = getSingleOrganizationKeyId(role)
        if (organizationKeyId === undefined || rolesByOrganization.has(organizationKeyId)) continue
        rolesByOrganization.set(organizationKeyId, role)
        departmentRoleKeyIds.add(role.keyId)
    }
    return {
        ...roleResponse,
        data: {
            list: roles.filter((role: Omix) => !departmentRoleKeyIds.has(role.keyId)),
            dept: mapDepartmentRoleTree(organizationResponse.data ?? [], rolesByOrganization),
            total: roles.length
        }
    }
}

/**角色关联账号列表**/
export async function httpBaseSystemColumnAccountRole(data: Omix): Promise<any> {
    const keyword = [data.vague, data.phone, data.email].find(value => Boolean(value))
    const response = await request({
        url: USER_API,
        method: 'GET',
        params: {
            page: Number(data.page ?? 1),
            pageSize: Math.min(Number(data.size ?? 50), 100),
            keyword,
            roleKeyId: data.roleId
        }
    })
    return {
        ...response,
        data: {
            page: response.data?.page ?? 1,
            size: response.data?.pageSize ?? 50,
            total: response.data?.total ?? 0,
            list: response.data?.items ?? []
        }
    }
}

/**角色关联用户**/
export async function httpBaseSystemCreateAccountRole(data: Omix): Promise<any> {
    await Promise.all((data.uids ?? []).map((uid: string) => replaceUserRole(uid, data.keyId, true)))
    return { code: 200, message: 'success', data: { success: true } } as any
}

/**删除角色关联用户**/
export async function httpBaseSystemDeleteAccountRole(data: Omix): Promise<any> {
    await Promise.all((data.uids ?? []).map((uid: string) => replaceUserRole(uid, data.roleId, false)))
    return { code: 200, message: 'success', data: { success: true } } as any
}

/**角色菜单权限列表**/
export async function httpBaseSystemColumnRoleSheet(data: Omix): Promise<any> {
    const response = await request({ url: `${ROLE_API}/${data.roleId}`, method: 'GET' })
    return { ...response, data: { list: response.data?.menuKeyIds ?? [] } }
}

/**更新角色菜单权限**/
export function httpBaseSystemUpdateRoleSheet(data: Omix) {
    return request({ url: `${ROLE_API}/${data.roleId}/menus`, method: 'PUT', data: { menuKeyIds: data.sheetIds ?? [] } })
}

/**更新角色数据权限**/
export function httpBaseSystemUpdateRoleModel(data: Omix) {
    return request({ url: `${ROLE_API}/${data.roleId}/data-scopes`, method: 'PUT', data: dataScopePayload(data) })
}

/**删除岗位角色**/
export function httpBaseSystemDeleteRole(data: Omix) {
    return request({ url: `${ROLE_API}/${data.keyId}`, method: 'DELETE' })
}

/**批量更新角色排序**/
export async function httpBaseSystemUpdateRoleSort(data: Omix): Promise<any> {
    const responses = await Promise.all(
        (data.list ?? []).map((item: Omix) => request({ url: `${ROLE_API}/${item.keyId}`, method: 'PATCH', data: { sort: item.sort } }))
    )
    return responses[0] ?? ({ code: 200, message: 'success', data: { success: true } } as any)
}

/**账号列表字段转换。仅供页面和业务组件使用，接口层保持原始传输。*/
export function mapDeployAccountUser(user: Omix): Omix {
    const organizations = user.organizations ?? user.depts ?? []
    return {
        ...user,
        depts: organizations,
        positions:
            user.positions ?? organizations.filter((item: Omix) => item.positionName).map((item: Omix) => ({ name: item.positionName })),
        ranks: user.ranks ?? [],
        roles: user.roles ?? []
    }
}

/**批量转换账号列表。*/
export function mapDeployAccountUsers(users: Array<Omix>): Array<Omix> {
    return users.map(mapDeployAccountUser)
}

/**转换账号下拉选项。*/
export function mapDeployAccountOptions(users: Array<Omix>): Array<Omix> {
    return mapDeployAccountUsers(users).map(user => ({
        ...user,
        label: user.number ? `${user.name} ${user.number}` : user.name,
        value: user.uid
    }))
}

/**将账号管理页面筛选条件转换为账号服务协议。*/
export function createDeployAccountQuery(data: Omix): Omix {
    const vague = [data.vague, data.name, data.phone, data.email].find(value => Boolean(value))
    return {
        page: data.page ?? 1,
        size: data.size ?? 50,
        vague: vague || undefined,
        status: data.status || undefined,
        organizationKeyIds: data.depts?.length ? data.depts : undefined,
        roleKeyId: data.roleId ?? data.roleKeyId
    }
}

/**将账号表单转换为创建/更新接口字段。*/
export function createDeployAccountPayload(data: Omix, creating = false): Omix {
    return {
        number: data.number,
        phone: data.phone,
        email: data.email || undefined,
        name: data.name,
        avatar: data.avatar || undefined,
        status: data.status ?? 'enabled',
        positionKeyIds: data.positionKeyIds ?? [],
        ...(creating ? { employmentStatus: data.employmentStatus ?? 'employed' } : {}),
        ...(creating ? { employmentTime: data.employmentTime ?? new Date().toISOString() } : {}),
        resignationTime: data.resignationTime || undefined
    }
}

/**生成账号组织关系请求字段。*/
export function createDeployAccountMemberships(depts: Array<number> = []): Array<Omix> {
    return depts.map((organizationKeyId, index) => ({
        organizationKeyId,
        isPrimary: index === 0,
        status: 'enabled'
    }))
}

/**将账号服务组织节点转换为管理端展示字段。*/
export function mapDeployOrganization(node: Omix): Omix {
    return {
        ...node,
        pid: node.parentKeyId,
        alias: node.code,
        accountCount: node.memberCount ?? 0,
        admin: node.leader,
        subAdmins: node.subAdmins ?? [],
        children: (node.children ?? []).map(mapDeployOrganization)
    }
}

/**批量转换组织树。*/
export function mapDeployOrganizations(nodes: Array<Omix>): Array<Omix> {
    return nodes.map(mapDeployOrganization)
}

/**扁平化组织树。*/
export function flattenDeployOrganizations(nodes: Array<Omix>): Array<Omix> {
    return nodes.flatMap(node => [node, ...flattenDeployOrganizations(node.children ?? [])])
}

/**将组织表单转换为账号服务协议。*/
export function createDeployOrganizationPayload(data: Omix): Omix {
    return {
        parentKeyId: data.pid ?? data.parentKeyId ?? null,
        code: data.code ?? data.alias,
        name: data.name,
        type: data.type ?? 'department',
        leaderUserUid: data.leaderUserUid ?? data.adminUid ?? null,
        sort: data.sort ?? 10,
        status: data.status ?? 'enabled'
    }
}

/**根据页面筛选条件生成组织分页数据。*/
export function createDeployOrganizationColumn(nodes: Array<Omix>, data: Omix): Omix {
    const list = flattenDeployOrganizations(mapDeployOrganizations(nodes)).filter(item => {
        if (data.pid !== undefined && data.pid !== null && item.pid !== data.pid) return false
        if (data.name && !item.name?.includes(data.name)) return false
        if (data.alias && !item.alias?.includes(data.alias)) return false
        return true
    })
    const page = data.page ?? 1
    const size = data.size ?? 50
    return {
        page,
        size,
        total: list.length,
        list: list.slice((page - 1) * size, page * size)
    }
}

/**将带成员的组织树展平为组织图节点。*/
export function mapDeployOrganizationChartNodes<T extends Omix>(nodes: Array<T> = []): Array<T> {
    const result: Array<Omix> = []
    function walk(list: Array<Omix>, parentId?: number | string) {
        for (const node of list) {
            const id = node.keyId ?? node.id
            result.push({
                ...node,
                id,
                pid: parentId,
                name: node.name,
                tags: ['dept']
            })
            for (const member of node.members ?? []) {
                result.push({
                    ...member,
                    id: `user:${id}:${member.uid}`,
                    pid: id,
                    name: member.name,
                    tags: ['user']
                })
            }
            walk(node.children ?? [], id)
        }
    }
    walk(nodes)
    return result as Array<T>
}

/**将角色表单转换为账号服务角色字段。*/
export function createDeployRolePayload(data: Omix): Omix {
    return {
        code: data.code ?? `role_${Date.now()}`,
        name: data.name,
        description: data.description ?? data.comment,
        sort: data.sort ?? 10,
        status: data.status ?? 'enabled'
    }
}

/**生成角色数据范围请求字段。*/
export function createDeployRoleDataScopePayload(data: Omix): Omix {
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

/**将账号服务角色转换为管理端字段。*/
export function mapDeployRole(role: Omix): Omix {
    const dataScope = (role.dataScopes ?? []).find((item: Omix) => item.resourceCode === 'account:user') ?? role.dataScopes?.[0]
    return {
        ...role,
        comment: role.description,
        chunk: role.builtin ? 'builtin' : 'custom',
        model: dataScope?.scopeType,
        organizationKeyIds: (dataScope?.organizations ?? []).map((item: Omix) => item.organizationKeyId)
    }
}

/**获取只关联一个组织的部门角色。*/
export function getDeploySingleOrganizationKeyId(role: Omix): number | undefined {
    const organizationKeyIds = [
        ...new Set<number>(
            (role.dataScopes ?? [])
                .flatMap((scope: Omix) => (scope.organizations ?? []).map((organization: Omix) => Number(organization.organizationKeyId)))
                .filter((keyId: number) => Number.isSafeInteger(keyId))
        )
    ]
    return organizationKeyIds.length === 1 ? organizationKeyIds[0] : undefined
}

/**构建组织节点与部门角色关联树。*/
export function mapDeployDepartmentRoleTree(nodes: Array<Omix>, rolesByOrganization: Map<number, Omix>): Array<Omix> {
    return nodes.flatMap(organization => {
        const children = mapDeployDepartmentRoleTree(organization.children ?? [], rolesByOrganization)
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

/**隐藏顶层公司节点，仅保留部门角色根节点。*/
export function getDeployDepartmentRoleTreeRoots(nodes: Array<Omix>): Array<Omix> {
    return nodes.flatMap(organization => (organization.type === 'company' ? (organization.children ?? []) : [organization]))
}

/**构建角色页面展示数据。*/
export function createDeployRoleView(rolesData: Array<Omix>, organizations: Array<Omix>): Omix {
    const roles = rolesData.map(mapDeployRole)
    const rolesByOrganization = new Map<number, Omix>()
    const departmentRoleKeyIds = new Set<number>()
    for (const role of roles) {
        const organizationKeyId = getDeploySingleOrganizationKeyId(role)
        if (organizationKeyId === undefined || rolesByOrganization.has(organizationKeyId)) continue
        rolesByOrganization.set(organizationKeyId, role)
        departmentRoleKeyIds.add(role.keyId)
    }
    return {
        list: roles.filter((role: Omix) => !departmentRoleKeyIds.has(role.keyId)),
        dept: mapDeployDepartmentRoleTree(getDeployDepartmentRoleTreeRoots(organizations), rolesByOrganization),
        total: roles.length
    }
}

/**合并账号当前角色并生成更新字段。*/
export function createDeployAccountRoleIds(current: Array<number>, roleKeyId: number, add: boolean): Array<number> {
    return add ? [...new Set([...current, roleKeyId])] : current.filter(item => item !== roleKeyId)
}

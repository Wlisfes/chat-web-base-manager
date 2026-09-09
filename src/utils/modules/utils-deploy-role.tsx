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
                .flatMap((scope: Omix) =>
                    (scope.organizations ?? []).map((organization: Omix) => Number(organization.organizationKeyId))
                )
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

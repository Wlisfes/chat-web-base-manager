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

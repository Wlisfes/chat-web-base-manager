/**账号列表字段转换。仅供页面和业务组件使用，接口层保持原始传输。*/
export function mapDeployAccountUser(user: Omix): Omix {
    const organizations = user.organizations ?? user.depts ?? []
    return {
        ...user,
        depts: organizations,
        positions:
            user.positions ??
            organizations
                .filter((item: Omix) => item.positionName)
                .map((item: Omix) => ({ keyId: item.keyId, name: item.positionName })),
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

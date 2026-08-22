import { request } from '@/utils'

const USER_API = '/api/account/users'

function mapUser(user: Omix): Omix {
    const organizations = user.organizations ?? []
    return {
        ...user,
        depts: organizations,
        positions: organizations
            .filter((item: Omix) => item.positionName)
            .map((item: Omix) => ({ keyId: item.keyId, name: item.positionName })),
        ranks: [],
        roles: user.roles ?? []
    }
}

function baseUserPayload(data: Omix, creating = false): Omix {
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

function membershipPayload(depts: Array<number> = []): Array<Omix> {
    return depts.map((organizationKeyId, index) => ({
        organizationKeyId,
        isPrimary: index === 0,
        status: 'enabled'
    }))
}

function userQuery(data: Omix): Omix {
    const keyword = [data.name, data.vague, data.phone, data.email].find(value => Boolean(value))
    return {
        page: Number(data.page ?? 1),
        pageSize: Math.min(Number(data.size ?? 50), 100),
        keyword: keyword || undefined,
        status: data.status || undefined,
        organizationKeyIds: data.depts?.length ? data.depts.join(',') : undefined,
        roleKeyId: data.roleId ?? data.roleKeyId
    }
}

/**新增账号**/
export function httpBaseSystemCreateAccount(data: Omix) {
    return request({
        url: USER_API,
        method: 'POST',
        data: {
            ...baseUserPayload(data, true),
            password: data.password,
            memberships: membershipPayload(data.depts),
            roleKeyIds: data.roleKeyIds ?? []
        }
    })
}

/**账号列表**/
export async function httpBaseSystemColumnAccount(data: Omix): Promise<any> {
    const response = await request({ url: USER_API, method: 'GET', params: userQuery(data) })
    return {
        ...response,
        data: {
            page: response.data?.page ?? data.page ?? 1,
            size: response.data?.pageSize ?? data.size ?? 50,
            total: response.data?.total ?? 0,
            list: (response.data?.items ?? []).map(mapUser)
        }
    }
}

/**编辑账号及组织关系**/
export async function httpBaseSystemUpdateAccount(data: Omix): Promise<any> {
    const update = await request({ url: `${USER_API}/${data.uid}`, method: 'PATCH', data: baseUserPayload(data) })
    await request({
        url: `${USER_API}/${data.uid}/organizations`,
        method: 'PUT',
        data: { memberships: membershipPayload(data.depts) }
    })
    return update
}

/**账号详情**/
export async function httpBaseSystemAccountResolver(data: Omix): Promise<any> {
    const response = await request({ url: `${USER_API}/${data.uid}`, method: 'GET' })
    return { ...response, data: mapUser(response.data) }
}

/**编辑账号状态**/
export function httpBaseSystemUpdateSwitchAccount(data: Omix) {
    return request({ url: `${USER_API}/${data.uid}`, method: 'PATCH', data: { status: data.status } })
}

/**账号服务暂不提供物理删除，调用方应使用禁用状态**/
export function httpBaseSystemDeleteAccount(data: Omix) {
    return httpBaseSystemUpdateSwitchAccount({ uid: data.uid, status: 'disabled' })
}

/**重置密码**/
export function httpBaseSystemResetPasswordAccount(data: Omix) {
    return request({ url: `${USER_API}/${data.uid}/password`, method: 'PUT', data: { password: '123456' } })
}

/**账号下拉列表**/
export async function httpBaseSystemSelectAccount(): Promise<any> {
    const response = await request({ url: USER_API, method: 'GET', params: { page: 1, pageSize: 100, status: 'enabled' } })
    const list = (response.data?.items ?? []).map((user: Omix) => ({
        ...mapUser(user),
        label: user.number ? `${user.name} ${user.number}` : user.name,
        value: user.uid
    }))
    return { ...response, data: list }
}

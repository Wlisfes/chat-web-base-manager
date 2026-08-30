import { request } from '@/utils'

type SheetType = 'directory' | 'menu' | 'button'

/**将账号服务菜单节点转换为管理端页面字段。*/
function mapMenu(node: Omix): Omix {
    return {
        ...node,
        pid: node.parentKeyId,
        chunk: node.type === 'button' ? 'authorize' : node.type === 'directory' ? 'directory' : 'resource',
        keyName: node.permissionCode,
        router: node.path,
        iconName: node.icon,
        check: node.visible,
        version: '1.0',
        children: (node.children ?? []).map(mapMenu)
    }
}

/**将管理端表单字段转换为账号服务菜单字段。*/
function menuPayload(data: Omix, type?: SheetType): Omix {
    const menuType = type ?? data.type ?? (data.chunk === 'authorize' ? 'button' : data.chunk === 'directory' ? 'directory' : 'menu')
    return {
        parentKeyId: data.pid ?? data.parentKeyId ?? null,
        type: menuType,
        name: data.name,
        routeName: data.routeName,
        path: menuType === 'button' ? undefined : data.router ?? data.path,
        component: data.component,
        permissionCode: data.keyName ?? data.permissionCode,
        icon: data.iconName ?? data.icon,
        externalUrl: data.externalUrl,
        sort: Number(data.sort ?? 10),
        visible: data.check ?? data.visible ?? true,
        keepAlive: data.keepAlive ?? false,
        status: data.status ?? 'enabled'
    }
}

/**新增菜单资源。*/
export function httpBaseSystemCreateSheetResource(data: Omix) {
    return request({
        url: `/api/account/menu/create`,
        method: 'POST',
        data: menuPayload(data, data.chunk === 'directory' ? 'directory' : 'menu')
    })
}

/**编辑菜单资源。*/
export function httpBaseSystemUpdateSheetResource(data: Omix) {
    return request({
        url: `/api/account/menu/update`,
        method: 'POST',
        data: { keyId: data.keyId, ...menuPayload(data) }
    })
}

/**菜单分页列表。*/
export async function httpBaseSystemColumnSheet(data: Omix): Promise<any> {
    const page = Math.max(1, Number(data.page ?? 1))
    const pageSize = Math.min(Math.max(1, Number(data.size ?? 50)), 100)
    const parentKeyId = data.pid === undefined || data.pid === null ? null : Number(data.pid)
    const response = await request({
        url: `/api/account/menu/column`,
        method: 'POST',
        data: {
            page,
            pageSize,
            parentKeyId,
            name: data.name || undefined,
            permissionCode: data.keyName || undefined,
            path: data.router || undefined
        }
    })
    return {
        ...response,
        data: {
            page: response.data?.page ?? page,
            size: response.data?.pageSize ?? pageSize,
            total: response.data?.total ?? 0,
            list: (response.data?.items ?? []).map(mapMenu)
        }
    }
}

/**菜单树结构。*/
export async function httpBaseSystemSheetTreeStructure(): Promise<any> {
    const response = await request({
        url: `/api/account/menu/tree/structure`,
        method: 'GET'
    })
    return {
        ...response,
        data: {
            list: (response.data ?? []).map(mapMenu)
        }
    }
}

/**菜单或按钮详情。*/
export async function httpBaseSystemSheetResolver(data: Omix): Promise<any> {
    const response = await request({
        url: `/api/account/menu/resolver`,
        method: 'GET',
        params: { keyId: data.keyId }
    })
    return {
        ...response,
        data: mapMenu(response.data)
    }
}

/**新增权限按钮。*/
export function httpBaseSystemCreateSheetAuthorize(data: Omix) {
    return request({
        url: `/api/account/menu/create`,
        method: 'POST',
        data: menuPayload(data, 'button')
    })
}

/**编辑权限按钮。*/
export function httpBaseSystemUpdateSheetAuthorize(data: Omix) {
    return request({
        url: `/api/account/menu/update`,
        method: 'POST',
        data: { keyId: data.keyId, ...menuPayload(data, 'button') }
    })
}

/**删除菜单或按钮。*/
export function httpBaseSystemDeleteSheet(data: Omix) {
    return request({
        url: `/api/account/menu/delete`,
        method: 'POST',
        data: { keyId: data.keyId }
    })
}

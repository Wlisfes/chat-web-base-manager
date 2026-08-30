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

/**将菜单树展平成列表。*/
function flattenMenus(nodes: Array<Omix>): Array<Omix> {
    return nodes.flatMap(node => [node, ...flattenMenus(node.children ?? [])])
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
    const response = await request({
        url: `/api/account/menu/tree/structure`,
        method: 'GET'
    })
    const mapped = flattenMenus((response.data ?? []).map(mapMenu)).filter(item => {
        if (data.pid !== undefined && data.pid !== null && item.pid !== data.pid) return false
        if (data.name && !item.name?.includes(data.name)) return false
        if (data.keyName && !item.keyName?.includes(data.keyName)) return false
        if (data.router && !item.router?.includes(data.router)) return false
        return true
    })
    const page = Number(data.page ?? 1)
    const size = Number(data.size ?? 50)
    return {
        ...response,
        data: {
            page,
            size,
            total: mapped.length,
            list: mapped.slice((page - 1) * size, page * size)
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

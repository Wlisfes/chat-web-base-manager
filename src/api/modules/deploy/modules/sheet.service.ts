import { request } from '@/utils'

const MENU_API = '/api/menus'

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

function flattenMenus(nodes: Array<Omix>): Array<Omix> {
    return nodes.flatMap(node => [node, ...flattenMenus(node.children ?? [])])
}

function menuPayload(data: Omix, type?: 'directory' | 'menu' | 'button'): Omix {
    const menuType = type ?? data.type ?? (data.chunk === 'authorize' ? 'button' : 'menu')
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

/**新增菜单**/
export function httpBaseSystemCreateSheetResource(data: Omix) {
    return request({ url: MENU_API, method: 'POST', data: menuPayload(data, data.chunk === 'directory' ? 'directory' : 'menu') })
}

/**编辑菜单**/
export function httpBaseSystemUpdateSheetResource(data: Omix) {
    return request({ url: `${MENU_API}/${data.keyId}`, method: 'PATCH', data: menuPayload(data) })
}

/**分页列表查询**/
export async function httpBaseSystemColumnSheet(data: Omix): Promise<any> {
    const response = await request({ url: `${MENU_API}/tree`, method: 'GET' })
    const mapped = flattenMenus((response.data ?? []).map(mapMenu)).filter(item => {
        if (data.pid !== undefined && data.pid !== null && item.pid !== data.pid) return false
        if (data.name && !item.name?.includes(data.name)) return false
        if (data.keyName && !item.keyName?.includes(data.keyName)) return false
        if (data.router && !item.router?.includes(data.router)) return false
        return true
    })
    const page = Number(data.page ?? 1)
    const size = Number(data.size ?? 50)
    return { ...response, data: { page, size, total: mapped.length, list: mapped.slice((page - 1) * size, page * size) } }
}

/**菜单树结构**/
export async function httpBaseSystemSheetTreeStructure(): Promise<any> {
    const response = await request({ url: `${MENU_API}/tree`, method: 'GET' })
    return { ...response, data: { list: (response.data ?? []).map(mapMenu) } }
}

/**菜单、按钮详情**/
export async function httpBaseSystemSheetResolver(data: Omix): Promise<any> {
    const response = await request({ url: `${MENU_API}/${data.keyId}`, method: 'GET' })
    return { ...response, data: mapMenu(response.data) }
}

/**新增权限按钮**/
export function httpBaseSystemCreateSheetAuthorize(data: Omix) {
    return request({ url: MENU_API, method: 'POST', data: menuPayload(data, 'button') })
}

/**编辑权限按钮**/
export function httpBaseSystemUpdateSheetAuthorize(data: Omix) {
    return request({ url: `${MENU_API}/${data.keyId}`, method: 'PATCH', data: menuPayload(data, 'button') })
}

/**删除菜单/按钮**/
export function httpBaseSystemDeleteSheet(data: Omix) {
    return request({ url: `${MENU_API}/${data.keyId}`, method: 'DELETE' })
}

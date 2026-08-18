import { ChunkName, ChunkCommonOptions, ChunkColumnOptions } from '@/interface/instance.resolver'

const option = (keyId: number, name: string, value: string | boolean, type = 'default'): Omix<ChunkColumnOptions> => ({
    keyId,
    name,
    value,
    label: name,
    json: { type, style: {} }
}) as unknown as Omix<ChunkColumnOptions>

const LOCAL_CHUNKS: Partial<Record<ChunkName, Array<Omix<ChunkColumnOptions>>>> = {
    CHUNK_ACCOUNT_STATUS: [option(1, '启用', 'enabled', 'success'), option(2, '禁用', 'disabled', 'error')],
    CHUNK_SHEET_CHECK: [option(1, '显示', true, 'success'), option(2, '隐藏', false, 'warning')],
    CHUNK_SHEET_CHUNK: [
        option(1, '目录', 'directory', 'default'),
        option(2, '菜单', 'resource', 'info'),
        option(3, '按钮', 'authorize', 'warning')
    ],
    CHUNK_SHEET_STATUS: [option(1, '启用', 'enabled', 'success'), option(2, '禁用', 'disabled', 'error')],
    CHUNK_ROLE_CHUNK: [option(1, '系统内置', 'builtin', 'warning'), option(2, '自定义', 'custom', 'info')],
    CHUNK_ROLE_MODEL: [
        option(1, '全部数据', 'all', 'success'),
        option(2, '仅本人', 'self', 'info'),
        option(3, '本组织', 'organization', 'warning'),
        option(4, '本组织及下级', 'organization_tree', 'warning'),
        option(5, '指定组织', 'custom', 'error')
    ]
}

function success<T>(data: T) {
    return Promise.resolve({ code: 200, message: 'success', data } as any)
}

function storageKey(keyName: string) {
    return `chat-web-manager:column:${keyName}`
}

/**当前账号管理能力使用共享 Schema 枚举，避免依赖旧平台字典接口。*/
export function httpBaseChunkSelect(data: Omix<{ type: Array<ChunkName> }>) {
    const chunks = data.type.reduce((result, name) => {
        result[name] = LOCAL_CHUNKS[name] ?? []
        return result
    }, {} as Omix<ChunkCommonOptions<Array<ChunkColumnOptions>>>)
    return success(chunks)
}

/**查询字段配置（仅保存在当前浏览器）。*/
export function httpBaseColumnChunkCustomize(data: Omix<{ keyName: string }>) {
    if (typeof window === 'undefined') return success({ customize: [], database: [] })
    try {
        return success(JSON.parse(window.localStorage.getItem(storageKey(data.keyName)) ?? '{}'))
    } catch {
        return success({ customize: [], database: [] })
    }
}

/**更新搜索栏字段配置。*/
export async function httpBaseUpdateChunkSearch(data: Omix<{ keyName: string; fields: Array<Omix> }>) {
    const current = await httpBaseColumnChunkCustomize(data)
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey(data.keyName), JSON.stringify({ ...current.data, database: data.fields }))
    }
    return success({ success: true })
}

/**更新表头字段配置。*/
export async function httpBaseUpdateChunkColumns(data: Omix<{ keyName: string; fields: Array<Omix> }>) {
    const current = await httpBaseColumnChunkCustomize(data)
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey(data.keyName), JSON.stringify({ ...current.data, customize: data.fields }))
    }
    return success({ success: true })
}

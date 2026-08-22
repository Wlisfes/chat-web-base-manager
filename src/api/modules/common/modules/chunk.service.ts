import { ChunkName, ChunkCommonOptions, ChunkColumnOptions } from '@/interface/instance.resolver'

const option = (keyId: number, name: string, value: string | boolean, type = 'default'): Omix<ChunkColumnOptions> => ({
    keyId,
    name,
    value,
    label: name,
    json: { type }
}) as unknown as Omix<ChunkColumnOptions>

const LOCAL_CHUNKS: Record<ChunkName, Array<Omix<ChunkColumnOptions>>> = {
    CHUNK_ACCOUNT_STATUS: [option(1, '启用', 'enabled', 'success'), option(2, '禁用', 'disabled', 'error')],
    CHUNK_SHEET_CHECK: [option(1, '显示', true, 'success'), option(2, '隐藏', false, 'warning')],
    CHUNK_SHEET_CHUNK: [
        option(1, '目录', 'directory'),
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
    ],
    CHUNK_BRAND_STATUS: [option(1, '启用', 'enable', 'success'), option(2, '禁用', 'disable', 'error')],
    CHUNK_CURRENCY_STATUS: [option(1, '启用', 'enable', 'success'), option(2, '禁用', 'disable', 'error')],
    CHUNK_COUNTRY_STATUS: [option(1, '启用', 'enable', 'success'), option(2, '禁用', 'disable', 'error')],
    CHUNK_CONSUMER_STATUS: [option(1, '启用', 'enable', 'success'), option(2, '禁用', 'disable', 'error')],
    CHUNK_CONSUMER_PAY_MODE: [option(1, '预付', 'prepaid', 'info'), option(2, '后付', 'postpaid', 'warning')],
    CHUNK_CONSUMER_AUTH_STATUS: [
        option(1, '未认证', 'unverified'),
        option(2, '认证中', 'pending', 'warning'),
        option(3, '已认证', 'verified', 'success'),
        option(4, '认证失败', 'rejected', 'error')
    ],
    CHUNK_CONSUMER_SOURCE: [option(1, '平台注册', 'platform', 'info'), option(2, '手动创建', 'manual', 'success')],
    CHUNK_CONSUMER_CLASS: [option(1, '普通客户', 'common', 'info'), option(2, '推广客户', 'cooperate', 'info')],
    CHUNK_CONSUMER_STAGE: [
        option(1, '线索阶段', 'cluetrail', 'info'),
        option(2, '意向阶段', 'intention', 'info'),
        option(3, '认证阶段', 'authenticate', 'info'),
        option(4, '测试阶段', 'testing', 'warning'),
        option(5, '充值阶段', 'charge', 'success'),
        option(6, '生产阶段', 'production', 'success'),
        option(7, '价值阶段', 'cooperate', 'success')
    ],
    CHUNK_CONSUMER_SMS_STATUS: [
        option(1, '未激活', 'inactive'),
        option(2, '已激活', 'active', 'success'),
        option(3, '禁用', 'disable', 'error')
    ],
    CHUNK_CONSUMER_SMS_TYPE: [
        option(1, '验证码', 'otp', 'success'),
        option(2, '营销短信', 'market', 'warning'),
        option(3, '通知短信', 'notify', 'info')
    ],
    CHUNK_DATETASK_TYPE: [
        option(1, '周期任务', 'cron', 'info'),
        option(2, '手动任务', 'manual', 'warning'),
        option(3, '系统任务', 'system')
    ],
    CHUNK_DATETASK_STATUS: [
        option(1, '停止', 'stop', 'error'),
        option(2, '等待运行', 'wait', 'info'),
        option(3, '运行中', 'running', 'success'),
        option(4, '已完成', 'finish', 'success')
    ],
    CHUNK_DATETASK_LOG_STATUS: [
        option(1, '执行中', 'running', 'info'),
        option(2, '成功', 'success', 'success'),
        option(3, '失败', 'failed', 'error')
    ],
    CHUNK_SMS_QUOTE_STATUS: [
        option(1, '待生效', 'pending', 'warning'),
        option(2, '已生效', 'effective', 'success'),
        option(3, '已删除', 'deleted', 'error')
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

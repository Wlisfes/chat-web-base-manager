import { ChunkName, ChunkCommonOptions, ChunkColumnOptions } from '@/interface/instance.resolver'
import type { CommonDatabaseTagColor } from '@/components/common/database/common-database-table-chunk.constants'

const option = (
    keyId: number,
    name: string,
    value: string | boolean,
    color: CommonDatabaseTagColor,
    type = 'default'
): Omix<ChunkColumnOptions> => ({
    keyId,
    name,
    value,
    label: name,
    json: { type, color, style: {} }
}) as unknown as Omix<ChunkColumnOptions>

const LOCAL_CHUNKS: Record<ChunkName, Array<Omix<ChunkColumnOptions>>> = {
    CHUNK_ACCOUNT_STATUS: [option(1, '启用', 'enabled', 'emerald', 'success'), option(2, '禁用', 'disabled', 'red', 'error')],
    CHUNK_SHEET_CHECK: [option(1, '显示', true, 'green', 'success'), option(2, '隐藏', false, 'gray', 'warning')],
    CHUNK_SHEET_CHUNK: [
        option(1, '目录', 'directory', 'violet'),
        option(2, '菜单', 'resource', 'blue', 'info'),
        option(3, '按钮', 'authorize', 'amber', 'warning')
    ],
    CHUNK_SHEET_STATUS: [option(1, '启用', 'enabled', 'lime', 'success'), option(2, '禁用', 'disabled', 'rose', 'error')],
    CHUNK_ROLE_CHUNK: [option(1, '系统内置', 'builtin', 'purple', 'warning'), option(2, '自定义', 'custom', 'cyan', 'info')],
    CHUNK_ROLE_MODEL: [
        option(1, '全部数据', 'all', 'indigo', 'success'),
        option(2, '仅本人', 'self', 'sky', 'info'),
        option(3, '本组织', 'organization', 'teal', 'warning'),
        option(4, '本组织及下级', 'organization_tree', 'green', 'warning'),
        option(5, '指定组织', 'custom', 'fuchsia', 'error')
    ],
    CHUNK_BRAND_STATUS: [option(1, '启用', 'enable', 'lime', 'success'), option(2, '禁用', 'disable', 'red', 'error')],
    CHUNK_CURRENCY_STATUS: [option(1, '启用', 'enable', 'emerald', 'success'), option(2, '禁用', 'disable', 'rose', 'error')],
    CHUNK_COUNTRY_STATUS: [option(1, '启用', 'enable', 'teal', 'success'), option(2, '禁用', 'disable', 'orange', 'error')],
    CHUNK_CLIENT_STATUS: [option(1, '启用', 'enable', 'green', 'success'), option(2, '禁用', 'disable', 'red', 'error')],
    CHUNK_CLIENT_PAY_MODE: [
        option(1, '预付', 'prepaid', 'blue', 'info'),
        option(2, '后付', 'postpaid', 'amber', 'warning')
    ],
    CHUNK_CLIENT_AUTH_STATUS: [
        option(1, '未认证', 'unverified', 'slate'),
        option(2, '认证中', 'pending', 'orange', 'warning'),
        option(3, '已认证', 'verified', 'emerald', 'success'),
        option(4, '认证失败', 'rejected', 'red', 'error')
    ],
    CHUNK_CLIENT_SOURCE: [
        option(1, '平台注册', 'platform', 'indigo', 'info'),
        option(2, '手动创建', 'manual', 'cyan', 'success')
    ],
    CHUNK_CLIENT_CLASS: [
        option(1, '普通客户', 'common', 'sky', 'info'),
        option(2, '推广客户', 'cooperate', 'fuchsia', 'info')
    ],
    CHUNK_CLIENT_STAGE: [
        option(1, '线索阶段', 'cluetrail', 'gray', 'info'),
        option(2, '意向阶段', 'intention', 'sky', 'info'),
        option(3, '认证阶段', 'authenticate', 'violet', 'info'),
        option(4, '测试阶段', 'testing', 'yellow', 'warning'),
        option(5, '充值阶段', 'charge', 'orange', 'success'),
        option(6, '生产阶段', 'production', 'green', 'success'),
        option(7, '价值阶段', 'cooperate', 'fuchsia', 'success')
    ],
    CHUNK_CLIENT_SMS_STATUS: [
        option(1, '未激活', 'inactive', 'slate'),
        option(2, '已激活', 'active', 'green', 'success'),
        option(3, '禁用', 'disable', 'red', 'error')
    ],
    CHUNK_CLIENT_SMS_TYPE: [
        option(1, '验证码', 'otp', 'violet', 'success'),
        option(2, '营销短信', 'market', 'pink', 'warning'),
        option(3, '通知短信', 'notify', 'cyan', 'info')
    ],
    CHUNK_DATETASK_TYPE: [
        option(1, '周期任务', 'cron', 'blue', 'info'),
        option(2, '手动任务', 'manual', 'orange', 'warning'),
        option(3, '系统任务', 'system', 'purple')
    ],
    CHUNK_DATETASK_STATUS: [
        option(1, '停止', 'stop', 'red', 'error'),
        option(2, '等待运行', 'wait', 'amber', 'info'),
        option(3, '运行中', 'running', 'cyan', 'success'),
        option(4, '已完成', 'finish', 'emerald', 'success')
    ],
    CHUNK_DATETASK_LOG_STATUS: [
        option(1, '执行中', 'running', 'sky', 'info'),
        option(2, '成功', 'success', 'green', 'success'),
        option(3, '失败', 'failed', 'rose', 'error')
    ],
    CHUNK_SMS_FORMOSAN_STATUS: [
        option(1, '待生效', 'pending', 'amber', 'warning'),
        option(2, '已生效', 'effective', 'emerald', 'success'),
        option(3, '已删除', 'deleted', 'brown', 'error')
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

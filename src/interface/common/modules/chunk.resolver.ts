/**枚举类型**/
export type ChunkName = keyof typeof COMMON_CHUNK_OPTIONS
/**通用下拉字典类型**/
export interface ChunkCommonOptions<T> extends Record<ChunkName, T> {}
/**通用下拉字典列表类型**/
export interface ChunkColumnOptions extends Omix {
    keyId: number
    name: string
    value: string
    json: Omix<{ type: string }>
}
/**通用下拉字典**/
export const COMMON_CHUNK_OPTIONS = {
    CHUNK_ACCOUNT_STATUS: {
        value: 'CHUNK_ACCOUNT_STATUS',
        name: '账号状态'
    },
    CHUNK_SHEET_CHECK: {
        value: 'CHUNK_SHEET_CHECK',
        name: '菜单显示状态'
    },
    CHUNK_SHEET_CHUNK: {
        value: 'CHUNK_SHEET_CHUNK',
        name: '菜单类型'
    },
    CHUNK_SHEET_STATUS: {
        value: 'CHUNK_SHEET_STATUS',
        name: '菜单状态'
    },
    CHUNK_ROLE_CHUNK: {
        value: 'CHUNK_ROLE_CHUNK',
        name: '角色类型'
    },
    CHUNK_ROLE_MODEL: {
        value: 'CHUNK_ROLE_MODEL',
        name: '角色数据权限'
    },
    CHUNK_BRAND_STATUS: {
        value: 'CHUNK_BRAND_STATUS',
        name: '品牌状态'
    },
    CHUNK_CURRENCY_STATUS: {
        value: 'CHUNK_CURRENCY_STATUS',
        name: '币种状态'
    },
    CHUNK_COUNTRY_STATUS: {
        value: 'CHUNK_COUNTRY_STATUS',
        name: '国家/地区状态'
    },
    CHUNK_CONSUMER_STATUS: {
        value: 'CHUNK_CONSUMER_STATUS',
        name: '客户状态'
    },
    CHUNK_CONSUMER_PAY_MODE: {
        value: 'CHUNK_CONSUMER_PAY_MODE',
        name: '付款模式'
    },
    CHUNK_CONSUMER_AUTH_STATUS: {
        value: 'CHUNK_CONSUMER_AUTH_STATUS',
        name: '认证状态'
    },
    CHUNK_CONSUMER_SOURCE: {
        value: 'CHUNK_CONSUMER_SOURCE',
        name: '注册来源'
    },
    CHUNK_CONSUMER_CLASS: {
        value: 'CHUNK_CONSUMER_CLASS',
        name: '客户类型'
    },
    CHUNK_CONSUMER_STAGE: {
        value: 'CHUNK_CONSUMER_STAGE',
        name: '客户阶段'
    },
    CHUNK_CONSUMER_SMS_STATUS: {
        value: 'CHUNK_CONSUMER_SMS_STATUS',
        name: '短信应用状态'
    },
    CHUNK_CONSUMER_SMS_TYPE: {
        value: 'CHUNK_CONSUMER_SMS_TYPE',
        name: '短信应用类型'
    },
    CHUNK_DATETASK_TYPE: {
        value: 'CHUNK_DATETASK_TYPE',
        name: '任务类型'
    },
    CHUNK_DATETASK_STATUS: {
        value: 'CHUNK_DATETASK_STATUS',
        name: '任务状态'
    },
    CHUNK_DATETASK_LOG_STATUS: {
        value: 'CHUNK_DATETASK_LOG_STATUS',
        name: '执行状态'
    },
    CHUNK_SMS_QUOTE_STATUS: {
        value: 'CHUNK_SMS_QUOTE_STATUS',
        name: '报价状态'
    }
}

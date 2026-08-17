import { ChunkName, ChunkCommonOptions, ChunkColumnOptions } from '@/interface/instance.resolver'
import { request } from '@/utils'

/**通用下拉字典**/
export function httpBaseChunkSelect(data: Omix<{ type: Array<ChunkName> }>) {
    return request<ChunkCommonOptions<Array<ChunkColumnOptions>>>({
        url: `/api/windows/chunk/enums/select`,
        method: 'POST',
        data
    })
}

/**查询字段配置**/
export function httpBaseColumnChunkCustomize(data: Omix<{ keyName: string }>) {
    return request({
        url: `/api/windows/chunk/field/customize`,
        method: 'POST',
        data
    })
}

/**更新搜索栏字段配置**/
export function httpBaseUpdateChunkSearch(data: Omix<{ keyName: string; fields: Array<Omix> }>) {
    return request({
        url: `/api/windows/chunk/update/search`,
        method: 'POST',
        data
    })
}

/**更新表头字段配置**/
export function httpBaseUpdateChunkColumns(data: Omix<{ keyName: string; fields: Array<Omix> }>) {
    return request({
        url: `/api/windows/chunk/update/columns`,
        method: 'POST',
        data
    })
}

import { request } from '@/utils'
import type * as Chunk from '@/interface/deploy/deploy-chunk.resolver'

/**获取枚举所属模块、字段类型和状态枚举**/
export function httpBaseSkylineChunkEnums() {
    return request<Chunk.ChunkEnumsResponse>({
        url: '/api/skyline/deploy/chunk/enums',
        method: 'GET'
    })
}

/**枚举分类分页列表**/
export function httpBaseSkylineColumnChunkModule(data: Chunk.ChunkModuleColumnRequest) {
    return request<Chunk.ChunkModuleColumnResponse>({
        url: '/api/skyline/deploy/chunk/column/module',
        method: 'POST',
        data
    })
}

/**枚举字典分页列表**/
export function httpBaseSkylineColumnChunk(data: Chunk.ChunkColumnRequest) {
    return request<Chunk.ChunkColumnResponse>({
        url: '/api/skyline/deploy/chunk/column',
        method: 'POST',
        data
    })
}

/**获取枚举字典详情**/
export function httpBaseSkylineResolverChunk(params: Chunk.ChunkKeyRequest) {
    return request<Chunk.ChunkItem>({
        url: '/api/skyline/deploy/chunk/resolve',
        method: 'GET',
        params
    })
}

/**新增枚举字典项**/
export function httpBaseSkylineCreateChunk(data: Chunk.ChunkCreateRequest) {
    return request<Chunk.ChunkItem>({
        url: '/api/skyline/deploy/chunk/create',
        method: 'POST',
        data
    })
}

/**更新枚举字典项**/
export function httpBaseSkylineUpdateChunk(data: Chunk.ChunkUpdateRequest) {
    return request<Chunk.ChunkItem>({
        url: '/api/skyline/deploy/chunk/update',
        method: 'POST',
        data
    })
}

/**删除枚举字典项**/
export function httpBaseSkylineDeleteChunk(data: Chunk.ChunkKeyRequest) {
    return request<Chunk.ChunkDeleteResponse>({
        url: '/api/skyline/deploy/chunk/delete',
        method: 'POST',
        data
    })
}

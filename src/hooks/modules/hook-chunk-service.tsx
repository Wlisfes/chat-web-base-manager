import { toRefs } from 'vue'
import { cloneDeep } from 'lodash-es'
import { useState } from '@/hooks'
import { pick } from '@/utils'
import { COMMON_CHUNK_OPTIONS, ChunkName, ChunkColumnOptions } from '@/interface/instance.resolver'
import * as Service from '@/api/instance.service'

/**枚举下拉通用hooks配置**/
interface ChunkServiceOptions<T extends Array<ChunkName>> {
    /**旧版本地枚举类型**/
    type?: T
    /**新版后端枚举接口**/
    request?: () => Promise<{ data?: Omix }>
    /**新版后端枚举接口返回的选项字段**/
    fields?: Array<string>
    /**立即执行**/
    immediate?: boolean
    /**初始化状态**/
    initialize?: boolean
    /**加载状态**/
    loading?: boolean
    /**初始化回调事件**/
    callback?: (data: Omix) => void
    /**数据转换**/
    transform?: (data: Omix) => Omix | Promise<Omix>
}

/**初始化字段对象**/
export interface ChunkBaseState<T extends Array<ChunkName>> extends Pick<ChunkServiceOptions<T>, 'loading' | 'initialize'> {
    type: ChunkName[]
}

/**初始化字段**/
function fetchInitState<T extends ChunkName[]>(options: ChunkServiceOptions<T>) {
    const legacyKeys = Array.from(new Set([...(options.type ?? []), ...Object.keys(pick(options, Object.keys(COMMON_CHUNK_OPTIONS)))]))
    const keys = options.request ? (options.fields ?? []) : legacyKeys
    const keysObject = keys.reduce((o: Omix, key: string) => ({ ...o, [key]: [] }), {})
    return useState<Omix>({
        ...keysObject,
        type: options.request ? [] : Array.from(new Set([...(options.type ?? []), ...Object.keys(keysObject)])),
        loading: options.loading ?? options.immediate ?? false,
        initialize: options.initialize ?? options.immediate ?? false
    })
}

/**枚举下拉通用hooks**/
export function useChunkService<T extends ChunkName[]>(options: ChunkServiceOptions<T>) {
    const { state, setState } = fetchInitState(options)

    if (options.immediate ?? true) {
        fetchRequest()
    }

    async function fetchRequest() {
        return await (setState as Function)({ loading: true }).then(async () => {
            try {
                const response = options.request
                    ? await options.request()
                    : await Service.httpBaseChunkSelect({ type: (state as ChunkBaseState<T>).type })
                const payload = response.data ?? {}
                const data = options.transform ? ((await options.transform(cloneDeep(payload))) ?? {}) : payload
                return await (setState as Function)({ ...data, loading: false, initialize: false }).then(async () => {
                    return options.callback?.(state)
                })
            } catch (err) {
                return await (setState as Function)({ loading: false, initialize: false }).then(async () => {
                    return options.callback?.(state)
                })
            }
        })
    }

    return {
        enumState: state,
        chunkState: state,
        ...toRefs(state),
        setState,
        fetchRequest
    } as Omix
}

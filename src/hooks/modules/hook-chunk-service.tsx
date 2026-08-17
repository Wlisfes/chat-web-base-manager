import { toRefs } from 'vue'
import { cloneDeep } from 'lodash-es'
import { useState } from '@/hooks'
import { pick } from '@/utils'
import { COMMON_CHUNK_OPTIONS, ChunkName, ChunkColumnOptions } from '@/interface/instance.resolver'
import * as Service from '@/api/instance.service'

/**枚举数枚举通用hooks配置**/
interface ChunkServiceOptions<T extends Array<ChunkName>> {
    type?: T
    /**立即执行**/
    immediate?: boolean
    /**初始化状态**/
    initialize?: boolean
    /**加载状态**/
    loading?: boolean
    /**初始化回调事件**/
    callback?: (data: Omix) => void
    /**数据转换**/
    transform?: (data: Record<keyof typeof COMMON_CHUNK_OPTIONS, Array<ChunkColumnOptions>>) => Omix<typeof data>
}

/**初始化字段对象**/
export interface ChunkBaseState<T extends Array<ChunkName>> extends Pick<ChunkServiceOptions<T>, 'loading' | 'initialize'> {
    type: ChunkName[]
}

/**初始化字段**/
function fetchInitState<T extends ChunkName[]>(options: ChunkServiceOptions<T>) {
    const keys = Array.from(new Set([...(options.type ?? []), ...Object.keys(pick(options, Object.keys(COMMON_CHUNK_OPTIONS)))]))
    const keysObject = keys.reduce((o: Omix, key: string) => ({ ...o, [key]: [] }), {})
    return useState({
        ...keysObject,
        type: Array.from(new Set([...(options.type ?? []), ...Object.keys(keysObject)])) as Array<ChunkName>,
        loading: options.loading ?? options.immediate ?? false,
        initialize: options.initialize ?? options.immediate ?? false
    } as ChunkBaseState<T> & { [K in T[number]]: Array<ChunkColumnOptions> })
}

/**枚举数枚举通用hooks**/
export function useChunkService<T extends ChunkName[]>(options: ChunkServiceOptions<T>) {
    const { state, setState } = fetchInitState(options)

    if (options.immediate ?? true) {
        fetchRequest()
    }

    async function fetchRequest() {
        return await (setState as Function)({ loading: true }).then(async () => {
            try {
                const { data } = await Service.httpBaseChunkSelect({ type: (state as ChunkBaseState<T>).type })
                const s = options.transform ? (options.transform(cloneDeep(data.data)) ?? {}) : data
                return await (setState as Function)({ ...s, loading: false, initialize: false }).then(async () => {
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
        chunkState: state,
        ...toRefs(state),
        setState,
        fetchRequest
    }
}

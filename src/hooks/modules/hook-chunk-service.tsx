import { ref, toRefs } from 'vue'
import { cloneDeep } from 'lodash-es'
import { useState } from '@/hooks'
import { pick } from '@/utils'
import { COMMON_CHUNK_OPTIONS, ChunkName, ChunkColumnOptions, ResultResolver } from '@/interface/instance.resolver'
import * as Service from '@/api/instance.service'

/**按接口拉取枚举的 hooks 配置**/
interface RequestChunkServiceOptions extends Omix {
    /**立即执行**/
    immediate?: boolean
    /**初始化状态**/
    initialize?: boolean
    /**加载状态**/
    loading?: boolean
    /**请求接口**/
    request: (data: Omix) => Promise<ResultResolver<Omix>>
}

/**按枚举类型拉取的 hooks 配置**/
interface TypeChunkServiceOptions<T extends Array<ChunkName>> {
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
export interface ChunkBaseState<T extends Array<ChunkName>> extends Pick<TypeChunkServiceOptions<T>, 'loading' | 'initialize'> {
    type: ChunkName[]
}

/**初始化按类型拉取的枚举字段**/
function fetchInitState<T extends ChunkName[]>(options: TypeChunkServiceOptions<T>) {
    const keys = Array.from(new Set([...(options.type ?? []), ...Object.keys(pick(options, Object.keys(COMMON_CHUNK_OPTIONS)))]))
    const keysObject = keys.reduce((o: Omix, key: string) => ({ ...o, [key]: [] }), {})
    return useState({
        ...keysObject,
        type: Array.from(new Set([...(options.type ?? []), ...Object.keys(keysObject)])) as Array<ChunkName>,
        loading: options.loading ?? options.immediate ?? false,
        initialize: options.initialize ?? options.immediate ?? false
    } as ChunkBaseState<T> & { [K in T[number]]: Array<ChunkColumnOptions> })
}

/**按业务接口拉取枚举**/
function useRequestChunkService(request: RequestChunkServiceOptions['request'], options: Omit<RequestChunkServiceOptions, 'request'> = {}) {
    const chunkOptions = ref<Omix>({})
    const { state, setState } = useState({
        loading: options.loading ?? options.immediate ?? true,
        initialize: options.initialize ?? options.immediate ?? true
    })

    if (options.immediate ?? true) {
        fetchChunk()
    }

    /**更新结果对象**/
    async function fetchUpdate(data: Omix) {
        return (chunkOptions.value = data)
    }

    async function fetchChunk() {
        return await setState({ loading: true }).then(async () => {
            try {
                return await request(state).then(async ({ data }) => {
                    return await fetchUpdate(data ?? {}).then(async () => {
                        return await setState({ initialize: false, loading: false })
                    })
                })
            } catch (err) {
                return await setState({ loading: false, initialize: false }).then(async () => {
                    return options.callback?.(state)
                })
            }
        })
    }

    return {
        chunkState: state,
        chunkOptions,
        setState,
        fetchChunk
    }
}

/**按通用枚举类型拉取字典**/
function useTypeChunkService<T extends ChunkName[]>(options: TypeChunkServiceOptions<T>) {
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

/**枚举下拉通用 hooks：兼容按接口拉取和按枚举类型拉取**/
export function useChunkService(request: RequestChunkServiceOptions['request'], options?: Omit<RequestChunkServiceOptions, 'request'>): ReturnType<typeof useRequestChunkService>
export function useChunkService<T extends ChunkName[]>(options: TypeChunkServiceOptions<T>): ReturnType<typeof useTypeChunkService<T>>
export function useChunkService(requestOrOptions: any, options: any = {}): any {
    if (typeof requestOrOptions === 'function') {
        return useRequestChunkService(requestOrOptions, options)
    }
    return useTypeChunkService(requestOrOptions)
}

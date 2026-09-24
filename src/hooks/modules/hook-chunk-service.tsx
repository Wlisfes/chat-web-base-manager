import { ref } from 'vue'
import { useState } from '@/hooks'
import { ResultResolver } from '@/interface/instance.resolver'

/**枚举下拉通用hooks配置**/
interface ChunkServiceOptions extends Omix {
    /**立即执行**/
    immediate?: boolean
    /**初始化状态**/
    initialize?: boolean
    /**加载状态**/
    loading?: boolean
    /**请求接口**/
    request: (data: Omix) => Promise<ResultResolver<Omix>>
}

/**枚举下拉通用hooks**/
export function useChunkService(request: ChunkServiceOptions['request'], options: Omit<ChunkServiceOptions, 'request'> = {}) {
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

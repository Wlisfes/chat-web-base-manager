import { toRefs, onMounted } from 'vue'
import { useState, useProvider } from '@/hooks'
import { fetchDelay, fetchHandler } from '@/utils'
interface BaseServiceState {
    /**验证码接口地址**/
    url: string
    /**验证码接口地址参数组合**/
    link: string
    /**初始化状态**/
    initialize: boolean
    /**加载状态**/
    loading: boolean
}
/**hooks基本配置**/
interface BaseServiceOptions<T> extends Partial<BaseServiceState> {
    /**立即执行**/
    immediate?: boolean
    /**额外数据**/
    options?: Omix<T>
}
export function useCodeService<T extends Omix>(options: BaseServiceOptions<T> = {}) {
    const { inverted } = useProvider()
    const { state, setState } = useState({
        url: options.url ?? '/api/windows/auth/codex/write',
        link: options.link ?? '',
        loading: options.loading ?? true,
        initialize: options.initialize ?? true,
        ...(options.options ?? {})
    } as BaseServiceState & typeof options.options)

    onMounted(async () => {
        return await fetchHandler(options.immediate ?? true, async () => {
            return await fetchRefresh(0)
        })
    })

    /**验证码加载回调**/
    async function fetchComplete(delay: number = 100) {
        return await fetchDelay(delay).then(async () => {
            return await setState({ initialize: false, loading: false } as never)
        })
    }

    /**刷新验证码**/
    async function fetchRefresh(delay: number = 300) {
        return await fetchDelay(delay).then(async () => {
            return await setState({
                loading: true,
                link: `${state.url}?inverse=${Number(inverted.value)}&t=${Math.random()}`
            } as never)
        })
    }

    return {
        state,
        ...toRefs(state),
        setState,
        fetchRefresh,
        fetchComplete
    }
}

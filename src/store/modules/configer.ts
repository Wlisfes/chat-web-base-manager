import { toRefs, computed } from 'vue'
import { defineStore } from 'pinia'
import { useState } from '@/hooks'

/**基础缓存配置实例**/
export const useConfiger = defineStore(
    'APP_STORE_CONFIGER',
    function () {
        const { state, setState } = useState({
            /**默认路由地址**/
            router: '/manager',
            /**默认主题**/
            theme: 'light',
            /**默认主题色**/
            primaryColor: '#536dfe',
            /**窗口宽度**/
            width: window.innerWidth,
            /**窗口高度**/
            height: window.innerHeight,
            /**默认窗口**/
            device: 'PC',
            /**菜单收缩**/
            collapsed: false,
            /**组件尺寸**/
            elementSize: 'medium'
        })

        /**重载配置**/
        async function fetchReset() {
            return await setState({ device: 'PC', collapsed: false, router: '/manager' })
        }

        /**主题切换**/
        async function fetchThemeUpdate(theme?: 'light' | 'dark') {
            return await setState({ theme: theme ?? state.theme === 'light' ? 'dark' : 'light' })
        }

        return {
            ...toRefs(state),
            setState,
            fetchReset,
            fetchThemeUpdate,
            inverted: computed(() => state.theme === 'dark')
        }
    },
    { persist: true }
)

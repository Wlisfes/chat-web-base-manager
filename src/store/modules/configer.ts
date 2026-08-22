import { toRefs, computed } from 'vue'
import { defineStore } from 'pinia'
import { useState } from '@/hooks'

type ViewTransitionDocument = Document & {
    startViewTransition?: (updateCallback: () => Promise<unknown>) => { finished: Promise<void> }
}

function releaseThemeSwitching(root: HTMLElement) {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
}

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
            const nextTheme = theme ?? (state.theme === 'light' ? 'dark' : 'light')
            if (nextTheme === state.theme) return state

            const root = document.documentElement
            const updateTheme = () => setState({ theme: nextTheme })
            const startViewTransition = (document as ViewTransitionDocument).startViewTransition?.bind(document)

            root.classList.add('theme-switching')
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                try {
                    return await updateTheme()
                } finally {
                    releaseThemeSwitching(root)
                }
            }

            if (startViewTransition) {
                try {
                    const transition = startViewTransition(updateTheme)
                    await transition.finished
                    return state
                } finally {
                    root.classList.remove('theme-switching')
                }
            }

            const app = document.getElementById('app')
            if (app && typeof app.animate === 'function') {
                let fadeOut: Animation | undefined
                let fadeIn: Animation | undefined
                try {
                    fadeOut = app.animate([{ opacity: 1 }, { opacity: 0.6 }], { duration: 70, easing: 'ease-out', fill: 'forwards' })
                    await fadeOut.finished.catch(() => undefined)
                    const result = await updateTheme()
                    fadeOut.cancel()
                    fadeIn = app.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 110, easing: 'ease-out' })
                    await fadeIn.finished.catch(() => undefined)
                    return result
                } finally {
                    fadeOut?.cancel()
                    fadeIn?.cancel()
                    root.classList.remove('theme-switching')
                }
            }

            try {
                return await updateTheme()
            } finally {
                releaseThemeSwitching(root)
            }
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

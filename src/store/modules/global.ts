import { ref, toRefs, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStore, useConfiger } from '@/store'
import { fetchMetaDefault } from '@/router'
import { omit, fetchDestroy } from '@/utils'
import { useState } from '@/hooks'
import * as Service from '@/api/instance.service'

export const useGlobal = defineStore('APP_STORE_GLOBAL', () => {
    const faseUser = ref<Omix>({})
    const faseMeta = ref<Omix>(fetchMetaDefault())
    const { state, setState } = useState({
        /**登录权限菜单**/
        menuOptions: [],
        /**登录权限按钮**/
        sheetOptions: [],
        /**标签页缓存**/
        tabOptions: [faseMeta.value]
    })

    /**keepAlive组件名称列表**/
    const keepTabNemas = computed<Array<string>>(() => {
        const items = state.tabOptions.filter(item => item.meta?.keepAlive)
        return items.map(item => item.name).filter(Boolean)
    })

    /**退出登录时重置store数据**/
    async function fetchReset() {
        return await fetchDestroy().then(async () => {
            await useStore(useConfiger).fetchReset()
            return await setState({ tabOptions: [faseMeta.value] }).then(() => {
                return (faseUser.value = {})
            })
        })
    }

    /**初始化**/
    async function fetchBaseInitialize() {
        return await Promise.all([fetchAuthAccountTokenResolver(), fetchAuthAccountTokenResource(), fetchAuthAccountTokenSheet()])
    }

    /**登录账户**/
    async function fetchAuthAccountToken(formState: Omix) {
        return await Service.httpAuthAccountToken({
            code: formState.code,
            number: formState.number,
            password: window.btoa(encodeURIComponent(formState.password))
        })
    }

    /**登录账户信息**/
    async function fetchAuthAccountTokenResolver() {
        return await Service.httpAuthAccountTokenResolver().then(async ({ data }) => {
            return (faseUser.value = data ?? {})
        })
    }

    /**登录账户权限**/
    async function fetchAuthAccountTokenResource() {
        return await Service.httpAuthAccountTokenResource().then(async ({ data }) => {
            return await setState({ menuOptions: data.list ?? [] })
        })
    }

    /**登录账户按钮权限**/
    async function fetchAuthAccountTokenSheet() {
        return await Service.httpAuthAccountTokenSheet().then(async ({ data }) => {
            return await setState({ sheetOptions: data.list ?? [] })
        })
    }

    /**缓存标签页**/
    async function fetchUpdateRouter(data: Omix) {
        const index = state.tabOptions.findIndex(item => item.fullPath === data.fullPath)
        if (index === -1) {
            return state.tabOptions.push(omit(data, ['matched']))
        } else {
            state.tabOptions[index].meta = data.meta
        }
        return state.tabOptions
    }

    /**删除标签页**/
    async function fetchRemoveRouter(data: Omix, router: any) {
        const index = state.tabOptions.findIndex(item => item.fullPath === data.fullPath)
        if (index === -1) return
        state.tabOptions.splice(index, 1)
        if (data.fullPath === router.currentRoute.value.fullPath) {
            const next = state.tabOptions[index] || state.tabOptions[index - 1]
            if (next) {
                await router.push({ path: next.fullPath })
            } else {
                await router.push({ path: '/manager' })
            }
        }
    }

    return {
        ...toRefs(state),
        faseUser,
        setState,
        fetchReset,
        fetchBaseInitialize,
        fetchAuthAccountToken,
        fetchAuthAccountTokenResolver,
        fetchAuthAccountTokenResource,
        fetchAuthAccountTokenSheet,
        fetchUpdateRouter,
        fetchRemoveRouter,
        keepTabNemas
    }
})

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
        menuOptions: [] as Array<Omix>,
        /**登录权限按钮**/
        sheetOptions: [] as Array<string>,
        /**是否超级管理员**/
        superAdmin: false,
        /**登录账户角色编码**/
        roleCodes: [] as Array<string>,
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
            return await setState({
                menuOptions: [],
                sheetOptions: [],
                superAdmin: false,
                roleCodes: [],
                tabOptions: [faseMeta.value]
            }).then(() => {
                return (faseUser.value = {})
            })
        })
    }

    /**初始化**/
    async function fetchBaseInitialize() {
        return await Promise.all([fetchAuthAccountTokenResolver(), fetchAuthAccountPermissions()])
    }

    /**登录账户**/
    async function fetchAuthAccountToken(formState: Omix) {
        return await Service.httpAuthAccountToken({
            code: formState.code,
            account: formState.number,
            password: window.btoa(encodeURIComponent(formState.password))
        })
    }

    /**登录账户信息**/
    async function fetchAuthAccountTokenResolver() {
        return await Service.httpAuthAccountTokenResolver().then(async ({ data }) => {
            return (faseUser.value = data ?? {})
        })
    }

    /**登录账户菜单、按钮和角色权限**/
    async function fetchAuthAccountPermissions() {
        return await Service.httpAuthAccountPermissions().then(async ({ data }) => {
            const menuOptions = fetchMenuOptions(data.menuTree ?? [])
            if (!fetchHasMenu(menuOptions, '/manager')) {
                menuOptions.unshift({ name: '工作台', router: '/manager', iconName: 'nest-compass' })
            }
            return await setState({
                menuOptions,
                sheetOptions: data.permissionCodes ?? [],
                superAdmin: data.superAdmin === true,
                roleCodes: data.roleCodes ?? []
            })
        })
    }

    /**退出登录；即使服务端暂不可用也清理本地身份。**/
    async function fetchAuthAccountTokenLogout() {
        try {
            await Service.httpAuthAccountTokenLogout()
        } catch {
            // 本地退出不应被网络异常阻断。
        } finally {
            await fetchReset()
        }
    }

    function fetchMenuOptions(nodes: Array<Omix>): Array<Omix> {
        return nodes.reduce<Array<Omix>>((items, node) => {
            if (node.visible === false || node.type === 'button') return items
            const children = fetchMenuOptions(node.children ?? [])
            const router = String(node.path ?? '').trim()
            if (node.type === 'directory' && !router && children.length === 0) return items
            items.push({
                name: node.name,
                router: router || `account-directory:${node.keyId}`,
                iconName: node.icon,
                children: children.length > 0 ? children : undefined
            })
            return items
        }, [])
    }

    function fetchHasMenu(nodes: Array<Omix>, router: string): boolean {
        return nodes.some(node => node.router === router || fetchHasMenu(node.children ?? [], router))
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
        fetchAuthAccountPermissions,
        fetchAuthAccountTokenLogout,
        fetchUpdateRouter,
        fetchRemoveRouter,
        keepTabNemas
    }
})

<script lang="tsx">
import { defineComponent, KeepAlive } from 'vue'
import { RouterView } from 'vue-router'
import { useConfiger, useGlobal, useStore } from '@/store'

export default defineComponent({
    name: 'BaseLayout',
    setup(props, ctx) {
        const { keepTabNemas } = useStore(useGlobal)
        const { collapsed, device, setState } = useStore(useConfiger)

        return () => (
            <n-layout class="h-full" content-class="flex flex-col overflow-hidden">
                <n-layout-header class="h-50 p-inline-16 flex items-center gap-24">
                    <layout-common-logo class="h-50"></layout-common-logo>
                    <layout-common-navigate></layout-common-navigate>
                    <layout-common-user></layout-common-user>
                </n-layout-header>
                <n-layout has-sider content-class="flex flex-col overflow-hidden">
                    <n-layout-sider
                        width={240}
                        collapse-mode="width"
                        native-scrollbar={false}
                        style={{ zIndex: 2 }}
                        collapsed={collapsed.value}
                        collapsed-width={device.value === 'MOBILE' ? 0 : 64}
                        show-trigger={device.value === 'MOBILE' ? false : 'bar'}
                        on-update:collapsed={(value: boolean) => setState({ collapsed: value })}
                    >
                        <layout-common-sider></layout-common-sider>
                    </n-layout-sider>
                    <n-layout content-class="flex flex-col overflow-hidden">
                        <layout-common-store></layout-common-store>
                        <n-layout-content
                            class="flex-1 overflow-hidden"
                            content-class="min-h-full flex flex-col overflow-hidden"
                            native-scrollbar={false}
                            scrollbar-props={{ size: 100, trigger: 'none' }}
                        >
                            <n-element class="flex flex-col flex-1 relative transition-background-color transition-duration-300 bg-[var(--common-body-bg-color)]">
                                <RouterView>
                                    {{
                                        default: ({ Component }: Omix) => {
                                            return <KeepAlive include={keepTabNemas.value}>{Component}</KeepAlive>
                                        }
                                    }}
                                </RouterView>
                            </n-element>
                        </n-layout-content>
                    </n-layout>
                </n-layout>
            </n-layout>
        )
    }
})
</script>

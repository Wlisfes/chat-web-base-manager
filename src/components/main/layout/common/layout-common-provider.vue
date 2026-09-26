<script lang="tsx">
import { defineComponent, Fragment } from 'vue'
import { dateZhCN, zhCN } from 'naive-ui'
import { useProvider } from '@/hooks'

export default defineComponent({
    name: 'LayoutCommonProvider',
    props: {
        /**开启global-style**/
        globalStyle: { type: Boolean, default: false },
        /**启用element根节点**/
        element: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        const { themeStyle, themeOverrides } = useProvider()

        return () => (
            <n-config-provider
                abstract
                inline-theme-disabled
                locale={zhCN}
                date-locale={dateZhCN}
                theme={themeStyle.value}
                theme-overrides={themeOverrides.value}
            >
                {props.globalStyle && <n-global-style />}
                <n-loading-bar-provider>
                    <n-dialog-provider>
                        <n-notification-provider max={5}>
                            <n-message-provider>
                                {props.element ? (
                                    <n-element class="w-full h-full overflow-hidden">{{ default: slots.default }}</n-element>
                                ) : (
                                    <Fragment>{slots.default && slots.default()}</Fragment>
                                )}
                            </n-message-provider>
                        </n-notification-provider>
                    </n-dialog-provider>
                </n-loading-bar-provider>
            </n-config-provider>
        )
    }
})
</script>

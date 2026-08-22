<script lang="tsx">
import { defineComponent, watchEffect } from 'vue'
import { dateZhCN, zhCN } from 'naive-ui'
import { useProvider } from '@/hooks'

export default defineComponent({
    name: 'LayoutCommonProvider',
    props: {
        globalStyle: { type: Boolean, default: false }
    },
    setup(props, { slots }) {
        const { themeStyle, themeOverrides, inverted } = useProvider()

        watchEffect(() => {
            document.documentElement.classList.toggle('app-theme-dark', inverted.value)
            document.documentElement.classList.toggle('app-theme-light', !inverted.value)
            document.documentElement.style.colorScheme = inverted.value ? 'dark' : 'light'
        })

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
                                <n-element class="w-full h-full overflow-hidden">{{ default: slots.default }}</n-element>
                            </n-message-provider>
                        </n-notification-provider>
                    </n-dialog-provider>
                </n-loading-bar-provider>
            </n-config-provider>
        )
    }
})
</script>

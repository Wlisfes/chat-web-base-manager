<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CommonElementCodex',
    emits: ['click', 'complete'],
    props: {
        /**加载状态**/
        loading: { type: Boolean, default: true },
        /**禁用状态**/
        disabled: { type: Boolean, default: false },
        /**图形验证码地址**/
        link: { type: String, required: true }
    },
    setup(props, { emit }) {
        return () => (
            <n-spin class="common-element-codex" size="small" content-class="flex flex-col" show={props.loading}>
                <common-element-button
                    class="p-0"
                    size="large"
                    secondary
                    disabled={props.loading || props.disabled}
                    onClick={() => emit('click', 0)}
                >
                    <n-image
                        class="flex flex-col"
                        preview-disabled
                        src={props.link}
                        on-load={() => emit('complete', 100)}
                        on-error={() => emit('complete', 100)}
                    >
                        {{
                            placeholder: () => (
                                <n-skeleton width={120} height={40} style={{ borderRadius: 'var(--n-border-radius)' }}></n-skeleton>
                            )
                        }}
                    </n-image>
                </common-element-button>
            </n-spin>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent } from 'vue'
import { Chat } from '@vicons/carbon'

export default defineComponent({
    name: 'CrmClientContextSmsSkeleton',
    props: {
        /**骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        return () => (
            <common-skeleton-provider
                is-white
                class-name="flex flex-col flex-1 overflow-hidden"
                loading={props.initialize}
                v-slots={{ render: slots.default }}
            >
                <common-element-columns-template class="gap-14 p-14" type="auto-fill" number={360}>
                    {Array.from({ length: 10 }, (_, index) => (
                        <n-card content-class="flex flex-col p-0! overflow-hidden">
                            <div class="flex gap-x-10 p-inline-14 p-block-14 overflow-hidden">
                                <common-skeleton-block>
                                    <common-element-alert-wrapper class="p-10" type="info">
                                        <n-icon size={28} color="var(--n-icon-color)">
                                            <Chat />
                                        </n-icon>
                                    </common-element-alert-wrapper>
                                </common-skeleton-block>
                                <div class="flex flex-col flex-1 gap-y-2 p-ie-40 overflow-hidden">
                                    <common-skeleton-block block="2px" class="line-height-24 m-ie-auto">
                                        LYNSK1233001OTP
                                    </common-skeleton-block>
                                    <common-skeleton-block block="2px" class="m-ie-auto">
                                        应用名称
                                    </common-skeleton-block>
                                </div>
                                <div class="m-be-auto flex items-center gap-x-5 overflow-hidden">
                                    <common-skeleton-block>
                                        <n-tag bordered={false} type="warning">
                                            营销短信
                                        </n-tag>
                                    </common-skeleton-block>
                                </div>
                            </div>
                            <div class="flex flex-col gap-y-14 p-inline-14 p-be-16 p-bs-2 overflow-hidden">
                                {Array.from({ length: 4 }, () => (
                                    <common-element-columns-wrapper label={<n-skeleton class="w-5.2em h-18 m-ie-10" sharp={false} />}>
                                        <n-skeleton class="w-full h-18" sharp={false} />
                                    </common-element-columns-wrapper>
                                ))}
                            </div>
                        </n-card>
                    ))}
                </common-element-columns-template>
            </common-skeleton-provider>
        )
    }
})
</script>

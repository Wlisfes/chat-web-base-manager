<script lang="tsx">
import { defineComponent } from 'vue'
import { Chip } from '@vicons/carbon'

export default defineComponent({
    name: 'SrmSupplierContextSimbankSkeleton',
    props: {
        /**最大骨架屏数量**/
        max: { type: Number, default: 20 },
        /**骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        return () => (
            <common-skeleton-provider
                class-name="flex flex-col flex-1 overflow-hidden"
                loading={props.initialize}
                v-slots={{ render: slots.default }}
            >
                <common-base-columns-template class="gap-14 p-14" type="auto-fill" number={360}>
                    {Array.from({ length: props.max }, () => (
                        <n-card content-class="flex flex-col p-0! overflow-hidden">
                            <div class="flex gap-x-10 p-inline-14 p-block-14 overflow-hidden">
                                <common-skeleton-block>
                                    <common-base-alert-wrapper class="p-10" type="info">
                                        <n-icon size={28} color="var(--n-icon-color)">
                                            <Chip />
                                        </n-icon>
                                    </common-base-alert-wrapper>
                                </common-skeleton-block>
                                <div class="flex flex-col flex-1 gap-y-2 p-ie-40 overflow-hidden">
                                    <common-skeleton-block block="2px" class="w-130 h-24">
                                        SSK1233SMSA004
                                    </common-skeleton-block>
                                    <common-skeleton-block block="1px" class="w-60 h-22">
                                        设备别名
                                    </common-skeleton-block>
                                </div>
                                <div class="m-be-auto flex items-center gap-x-5 overflow-hidden">
                                    <common-skeleton-block>
                                        <n-tag bordered={false} type="success">
                                            在线
                                        </n-tag>
                                    </common-skeleton-block>
                                </div>
                            </div>
                            <div class="flex flex-col gap-y-10 p-inline-14 p-be-14 overflow-hidden">
                                {Array.from({ length: 5 }, () => (
                                    <common-base-columns-wrapper
                                        class="p-block-2"
                                        label={<n-skeleton class="w-4.6em m-ie-10 h-20" sharp={false} />}
                                    >
                                        <n-skeleton class="w-full h-20" sharp={false} />
                                    </common-base-columns-wrapper>
                                ))}
                            </div>
                        </n-card>
                    ))}
                </common-base-columns-template>
            </common-skeleton-provider>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent } from 'vue'
import { ApplicationWeb } from '@vicons/carbon'

export default defineComponent({
    name: 'SrmSupplierContextSkeleton',
    props: {
        /**开启骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        return () => (
            <common-skeleton-provider
                class-name="flex flex-col flex-1 relative overflow-hidden"
                loading={props.initialize}
                v-slots={{ render: slots.default }}
            >
                <common-base-element class="absolute inset-0 flex flex-col overflow-hidden">
                    <common-base-element is-white class="flex flex-col p-inline-16 p-bs-16 p-be-5 overflow-hidden">
                        <div class="flex p-be-10 overflow-hidden">
                            <div class="flex flex-col flex-1 gap-y-10 overflow-hidden">
                                <div class="flex gap-10 overflow-hidden">
                                    <n-skeleton sharp={false} height="24px" width="320px" />
                                </div>
                                <div class="flex gap-x-20 text-12 line-height-16 overflow-hidden">
                                    <n-skeleton sharp={false} height="16px" width="197px" />
                                    <n-skeleton sharp={false} height="16px" width="123px" />
                                    <n-skeleton sharp={false} height="16px" width="91px" />
                                    <n-skeleton sharp={false} height="16px" width="80px" />
                                </div>
                            </div>
                            <div class="flex gap-x-10 m-be-auto overflow-hidden">
                                <n-skeleton sharp={false} height="32px" width="80px" />
                                <n-skeleton sharp={false} height="32px" width="80px" />
                                <n-skeleton sharp={false} height="32px" width="80px" />
                                <n-skeleton sharp={false} height="32px" width="80px" />
                            </div>
                        </div>
                        <common-business-progressbar initialize></common-business-progressbar>
                    </common-base-element>
                    <n-tabs
                        animated
                        type="line"
                        bar-width={0}
                        tabs-padding={16}
                        default-value="basic"
                        class="common-base-tabser inset-absolute flex-1 overflow-hidden"
                    >
                        <n-tab-pane
                            disabled
                            name="basic"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title initialize title="详细信息" icon={<ApplicationWeb />} />}
                        >
                            <srm-supplier-context-basic-skeleton initialize />
                        </n-tab-pane>
                    </n-tabs>
                </common-base-element>
            </common-skeleton-provider>
        )
    }
})
</script>

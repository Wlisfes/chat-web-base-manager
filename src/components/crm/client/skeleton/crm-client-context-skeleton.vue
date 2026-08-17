<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CrmClientContextSkeleton',
    props: {
        /**开启骨架屏**/
        initialize: { type: Boolean, default: true }
    },
    setup(props, { slots }) {
        return () => (
            <common-skeleton-provider
                class-name="flex flex-col flex-1 gap-14 p-inline-14 p-block-14"
                loading={props.initialize}
                v-slots={{ render: slots.default }}
            >
                <n-card class="flex flex-col" content-class="p-16! flex flex-col gap-10">
                    <div class="flex flex-col overflow-hidden">
                        <div class="flex justify-between gap-20 overflow-hidden">
                            <div class="flex flex-col overflow-hidden">
                                <div class="flex gap-20 text-12 line-height-16 overflow-hidden">
                                    <n-skeleton sharp={false} height="16px" width="180px" />
                                </div>
                                <div class="flex items-center p-block-8 gap-10 overflow-hidden">
                                    <n-skeleton sharp={false} height="24px" width="320px" />
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-20 text-12 line-height-16 overflow-hidden">
                            <n-skeleton sharp={false} height="16px" width="180px" />
                        </div>
                    </div>
                    <common-business-progressbar initialize></common-business-progressbar>
                </n-card>
                <n-tabs
                    animated
                    type="line"
                    default-value="sms"
                    bar-width={0}
                    tabs-padding={14}
                    class="common-element-tabser inset-absolute flex-1 overflow-hidden"
                >
                    <n-tab-pane name="basic" display-directive="show" tab={() => <common-skeleton-block>详情信息</common-skeleton-block>}>
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                    <n-tab-pane name="sms" display-directive="show" tab={() => <common-skeleton-block>短信应用</common-skeleton-block>}>
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                    <n-tab-pane name="mail" display-directive="show" tab={() => <common-skeleton-block>邮件应用</common-skeleton-block>}>
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                    <n-tab-pane
                        name="whatsapp"
                        display-directive="show"
                        tab={() => <common-skeleton-block>社媒应用</common-skeleton-block>}
                    >
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                    <n-tab-pane name="deploy" display-directive="show" tab={() => <common-skeleton-block>配置</common-skeleton-block>}>
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                    <n-tab-pane name="attachment" display-directive="show" tab={() => <common-skeleton-block>附件</common-skeleton-block>}>
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                    <n-tab-pane name="daily" display-directive="show" tab={() => <common-skeleton-block>日志</common-skeleton-block>}>
                        <common-element-scrollbar>
                            <crm-client-context-sms-skeleton initialize></crm-client-context-sms-skeleton>
                        </common-element-scrollbar>
                    </n-tab-pane>
                </n-tabs>
            </common-skeleton-provider>
        )
    }
})
</script>

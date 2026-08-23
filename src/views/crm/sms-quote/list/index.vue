<script lang="tsx">
import { defineComponent } from 'vue'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'CrmSmsQuoteList',
    setup(props, ctx) {
        const { state } = useState({ tabName: 'effective' })

        return () => (
            <layout-common-container class-name="p-14">
                <n-tabs
                    animated
                    type="line"
                    tabs-padding={14}
                    class="common-element-tabser inset-absolute flex-1 overflow-hidden"
                    v-model:value={state.tabName}
                >
                    <n-tab-pane name="effective" tab="已生效" display-directive="show:lazy">
                        <crm-sms-quote-list status="effective"></crm-sms-quote-list>
                    </n-tab-pane>
                    <n-tab-pane name="pending" tab="待生效" display-directive="show:lazy">
                        <crm-sms-quote-list status="pending"></crm-sms-quote-list>
                    </n-tab-pane>
                    <n-tab-pane name="deleted" tab="已删除" display-directive="show:lazy">
                        <crm-sms-quote-list status="deleted"></crm-sms-quote-list>
                    </n-tab-pane>
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>

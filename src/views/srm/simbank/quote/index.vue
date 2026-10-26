<script lang="tsx">
import { defineComponent } from 'vue'
import { Observer } from '@/utils'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'SrmSimbankQuoteManager',
    setup(props, ctx) {
        const { state } = useState({ tabName: 'effective', observer: Observer<Record<string, Omix>>() })

        return () => (
            <layout-common-container class-name="p-14">
                <n-tabs
                    animated
                    type="line"
                    tabs-padding={14}
                    default-value="effective"
                    v-model:value={state.tabName}
                    class="common-base-tabser inset-border inset-absolute overflow-hidden"
                >
                    <n-tab-pane name="effective" tab="已生效" display-directive="show:lazy">
                        <srm-simbank-quote-list-wrapper status="effective"></srm-simbank-quote-list-wrapper>
                    </n-tab-pane>
                    <n-tab-pane name="pending" tab="待生效" display-directive="show:lazy">
                        <srm-simbank-quote-list-wrapper status="pending"></srm-simbank-quote-list-wrapper>
                    </n-tab-pane>
                    <n-tab-pane name="expired" tab="已失效" display-directive="show:lazy">
                        <srm-simbank-quote-list-wrapper status="expired"></srm-simbank-quote-list-wrapper>
                    </n-tab-pane>
                    <n-tab-pane name="deleted" tab="已作废" display-directive="show:lazy">
                        <srm-simbank-quote-list-wrapper status="deleted"></srm-simbank-quote-list-wrapper>
                    </n-tab-pane>
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>

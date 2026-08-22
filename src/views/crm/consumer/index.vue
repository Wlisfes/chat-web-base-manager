<script lang="tsx">
import { defineComponent } from 'vue'
import { Observer } from '@/utils'
import { useColumnService, useState } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumer',
    setup(props, ctx) {
        const { state, setState } = useState({ tabName: 'common', observer: Observer<Record<string, Omix>>() })

        return () => (
            <layout-common-container class-name="p-14">
                <n-tabs
                    animated
                    type="line"
                    default-value="account"
                    tabs-padding={14}
                    class="common-element-tabser inset-absolute flex-1 overflow-hidden "
                    v-model:value={state.tabName}
                >
                    <n-tab-pane name="common" tab="普通客户" display-directive="show">
                        <crm-consumer-common-list observer={state.observer}></crm-consumer-common-list>
                    </n-tab-pane>
                    <n-tab-pane name="conspire" tab="推广客户" display-directive="show">
                        <crm-consumer-promotion-list observer={state.observer}></crm-consumer-promotion-list>
                    </n-tab-pane>
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>

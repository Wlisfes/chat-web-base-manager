<script lang="tsx">
import { defineComponent } from 'vue'
import { Observer } from '@/utils'
import { useColumnService, useState } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmPartner',
    setup(props, ctx) {
        const { state, setState } = useState({ tabName: 'common', observer: Observer<Record<string, Omix>>() })

        return () => (
            <layout-common-container class-name="p-14">
                <n-tabs
                    animated
                    type="line"
                    default-value="account"
                    tab-class="p-block-12!"
                    tabs-padding={14}
                    class="common-base-tabser inset-absolute flex-1 overflow-hidden "
                    v-model:value={state.tabName}
                >
                    <n-tab-pane name="common" tab="普通客户" display-directive="show">
                        <crm-common-list-consumer observer={state.observer}></crm-common-list-consumer>
                    </n-tab-pane>
                    <n-tab-pane name="conspire" tab="推广客户" display-directive="show">
                        <crm-conspire-list-consumer observer={state.observer}></crm-conspire-list-consumer>
                    </n-tab-pane>
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent } from 'vue'
import { useSelectService, useChunkService, useState, Observer } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumer',
    setup(props, ctx) {
        const { state } = useState({ tabName: 'common', observer: Observer<Record<string, Omix>>() })
        /**品牌下拉列表**/
        const brandOptions = useSelectService(e => Service.httpBaseFinanceSelectBrand(), {
            immediate: true
        })
        /**币种下拉列表**/
        const currencyOptions = useSelectService(e => Service.httpBaseFinanceSelectCurrency(), {
            immediate: true
        })
        /**客户静态枚举、字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_CRM_USER_SOURCE'],
            immediate: true
        })

        return () => (
            <layout-common-container class-name="p-14 overflow-hidden">
                <n-tabs
                    animated
                    type="line"
                    default-value="account"
                    tabs-padding={14}
                    class="common-base-tabser inset-absolute inset-border flex-1 overflow-hidden"
                    v-model:value={state.tabName}
                >
                    <n-tab-pane name="common" tab="普通客户" display-directive="show:lazy">
                        <crm-common-list-consumer
                            observer={state.observer}
                            chunk-state={chunkState}
                            brand-options={brandOptions}
                            currency-options={currencyOptions}
                            chunk-options={chunkOptions.value}
                        ></crm-common-list-consumer>
                    </n-tab-pane>
                    <n-tab-pane name="conspire" tab="推广客户" display-directive="show:lazy">
                        <crm-conspire-list-consumer
                            observer={state.observer}
                            chunk-state={chunkState}
                            brand-options={brandOptions}
                            currency-options={currencyOptions}
                            chunk-options={chunkOptions.value}
                        ></crm-conspire-list-consumer>
                    </n-tab-pane>
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>

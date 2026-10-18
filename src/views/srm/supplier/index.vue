<script lang="tsx">
import { defineComponent } from 'vue'
import { useState, useChunkService, Observer } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSupplier',
    setup(props, ctx) {
        const { state } = useState({ tabName: 'common', observer: Observer<Record<string, Omix>>() })
        /**供应商静态枚举、字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_USER_SOURCE'],
            immediate: true
        })

        return () => (
            <layout-common-container class-name="p-14 overflow-hidden">
                <n-tabs
                    animated
                    type="line"
                    tabs-padding={14}
                    default-value="common"
                    class="common-base-tabser inset-absolute inset-border flex-1 overflow-hidden "
                    v-model:value={state.tabName}
                >
                    <n-tab-pane name="common" tab="全部供应商" display-directive="show:lazy">
                        <crm-common-list-supplier
                            observer={state.observer}
                            chunk-state={chunkState}
                            chunk-options={chunkOptions.value}
                        ></crm-common-list-supplier>
                    </n-tab-pane>
                    <n-tab-pane name="star" tab="关注供应商" display-directive="show:lazy">
                        <crm-common-list-supplier
                            observer={state.observer}
                            chunk-state={chunkState}
                            chunk-options={chunkOptions.value}
                        ></crm-common-list-supplier>
                    </n-tab-pane>
                </n-tabs>
            </layout-common-container>
        )
    }
})
</script>

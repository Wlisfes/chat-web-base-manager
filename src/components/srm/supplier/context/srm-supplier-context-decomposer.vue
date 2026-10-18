<script lang="tsx">
import { defineComponent } from 'vue'
import { useBaseService, useChunkService } from '@/hooks'
import { ApplicationWeb } from '@vicons/carbon'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSupplierContextDecomposer',
    inheritAttrs: false,
    props: {
        /**供应商ID**/
        keyId: { type: [String, Number] }
    },
    setup(props) {
        /**供应商静态枚举、注册来源字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_USER_SOURCE', 'CHUNK_SKYLINE_CONTACT_TYPE'],
            immediate: true
        })
        const { faseNode, faseState } = useBaseService(() => Service.httpBaseSrmUserResolver({ keyId: props.keyId }), {
            immediate: true,
            options: { tabName: 'basic' }
        })

        return () => (
            <srm-supplier-context-skeleton initialize={faseState.initialize}>
                <common-base-element class="absolute inset-0 flex flex-col overflow-hidden">
                    <srm-supplier-context-wrapper
                        initialize={faseState.initialize}
                        chunk-options={chunkOptions.value}
                        chunk-state={chunkState}
                        v-model:faseNode={faseNode.value}
                    ></srm-supplier-context-wrapper>
                    <n-tabs
                        animated
                        type="line"
                        tabs-padding={16}
                        v-model:value={faseState.tabName}
                        class="common-base-tabser inset-absolute flex-1 overflow-hidden"
                    >
                        <n-tab-pane
                            name="basic"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title title="详细信息" icon={<ApplicationWeb />} />}
                        >
                            <srm-supplier-context-basic-wrapper
                                chunk-state={chunkState}
                                chunk-options={chunkOptions.value}
                                v-model:faseNode={faseNode.value}
                            ></srm-supplier-context-basic-wrapper>
                        </n-tab-pane>
                    </n-tabs>
                </common-base-element>
            </srm-supplier-context-skeleton>
        )
    }
})
</script>

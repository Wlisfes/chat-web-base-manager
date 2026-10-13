<script lang="tsx">
import { defineComponent } from 'vue'
import { useBaseService, useChunkService } from '@/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumerContextDecomposer',
    inheritAttrs: false,
    props: {
        /**客户ID**/
        keyId: { type: [String, Number] }
    },
    setup(props) {
        /**客户静态枚举、注册来源字典枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_CRM_CRM_USER_SOURCE', 'CHUNK_SYSTEM_COMMON_CONTACT_TYPE'],
            immediate: true
        })
        const { faseNode, faseState } = useBaseService(() => Service.httpBaseCrmUserResolver({ keyId: props.keyId }), {
            immediate: true,
            options: {
                tabName: 'basic'
            }
        })

        return () => (
            <crm-consumer-context-skeleton initialize={faseState.initialize}>
                <common-base-scrollbar class="absolute inset-0 overflow-hidden">
                    <crm-consumer-context-wrapper
                        initialize={faseState.initialize}
                        chunk-options={chunkOptions.value}
                        v-model:faseNode={faseNode.value}
                    ></crm-consumer-context-wrapper>
                    <common-base-element class="flex flex-col flex-1 gap-14 p-inline-14 p-block-14">
                        <crm-consumer-context-sms-wrapper v-model:faseNode={faseNode.value}></crm-consumer-context-sms-wrapper>
                    </common-base-element>
                </common-base-scrollbar>
                {/* <common-base-element class="flex flex-col flex-1 gap-14 p-inline-14 p-block-14">
                    <crm-consumer-context-wrapper
                        initialize={faseState.initialize}
                        chunk-options={chunkOptions.value}
                        v-model:faseNode={faseNode.value}
                    ></crm-consumer-context-wrapper>
                    <n-tabs
                        animated
                        type="line"
                        tabs-padding={14}
                        class="common-base-tabser inset-absolute flex-1 overflow-hidden "
                        v-model:value={faseState.tabName}
                    >
                        <n-tab-pane name="basic" tab="详情信息" display-directive="show:lazy">
                            <crm-consumer-context-basic-wrapper
                                chunk-options={chunkOptions.value}
                                chunk-state={chunkState}
                                source-options={chunkState.CHUNK_CRM_CRM_USER_SOURCE.options}
                                v-model:faseNode={faseNode.value}
                            ></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="sms" tab="短信应用" display-directive="show">
                            <crm-consumer-context-sms-wrapper v-model:faseNode={faseNode.value}></crm-consumer-context-sms-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="mail" tab="邮件应用" display-directive="show:lazy">
                            <crm-consumer-context-mail-wrapper></crm-consumer-context-mail-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="whatsapp" tab="社媒应用" display-directive="show:lazy">
                            <crm-consumer-context-whatsapp-wrapper></crm-consumer-context-whatsapp-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="deploy" tab="配置" display-directive="show:lazy">
                            <crm-consumer-context-basic-wrapper></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="attachment" tab="附件" display-directive="show:lazy">
                            <crm-consumer-context-attachment-wrapper></crm-consumer-context-attachment-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="daily" tab="日志" display-directive="show:lazy">
                            <crm-consumer-context-daily-wrapper></crm-consumer-context-daily-wrapper>
                        </n-tab-pane>
                    </n-tabs>
                </common-base-element> */}
            </crm-consumer-context-skeleton>
        )
    }
})
</script>

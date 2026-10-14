<script lang="tsx">
import { defineComponent } from 'vue'
import { useBaseService, useChunkService } from '@/hooks'
import { Lightning, Chat, Document, Book } from '@vicons/carbon'
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
            options: { tabName: 'sms' }
        })

        return () => (
            <crm-consumer-context-skeleton initialize={faseState.initialize}>
                <common-base-element class="absolute inset-0 flex flex-col overflow-hidden">
                    <crm-consumer-context-wrapper
                        initialize={faseState.initialize}
                        chunk-options={chunkOptions.value}
                        chunk-state={chunkState}
                        v-model:faseNode={faseNode.value}
                    ></crm-consumer-context-wrapper>
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
                            tab={
                                <div class="flex items-center gap-x-5 overflow-hidden">
                                    <n-icon size={18} component={<Document />} />
                                    详情信息
                                </div>
                            }
                        >
                            <crm-consumer-context-basic-wrapper
                                chunk-state={chunkState}
                                chunk-options={chunkOptions.value}
                                v-model:faseNode={faseNode.value}
                            ></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane
                            name="sms"
                            display-directive="show"
                            tab={
                                <div class="flex items-center gap-x-5 overflow-hidden">
                                    <n-icon size={18} component={<Chat />} />
                                    短信应用
                                </div>
                            }
                        >
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
                </common-base-element>
                {/* <common-base-scrollbar class="absolute inset-0 overflow-hidden">
                    <crm-consumer-context-wrapper
                        initialize={faseState.initialize}
                        chunk-options={chunkOptions.value}
                        v-model:faseNode={faseNode.value}
                    ></crm-consumer-context-wrapper>
                    <common-base-element class="flex flex-col flex-1 p-block-14 overflow-hidden">
                        <n-tabs
                            animated
                            type="line"
                            tabs-padding={14}
                            class="common-base-tabser flex-1 overflow-hidden "
                            v-model:value={faseState.tabName}
                        >
                            <n-tab-pane name="basic" tab="详情信息" display-directive="show:lazy">
                                <crm-consumer-context-basic-wrapper
                                    chunk-state={chunkState}
                                    chunk-options={chunkOptions.value}
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
                    </common-base-element>
                </common-base-scrollbar> */}
            </crm-consumer-context-skeleton>
        )
    }
})
</script>

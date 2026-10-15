<script lang="tsx">
import { defineComponent } from 'vue'
import { useBaseService, useChunkService } from '@/hooks'
import { Chat, ApplicationWeb, Email, ChangeCatalog, SettingsServices, CloudServices } from '@vicons/carbon'
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
            options: { tabName: 'basic' }
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
                            tab={<common-base-tab-title title="详细信息" icon={<ApplicationWeb />} />}
                        >
                            <crm-consumer-context-basic-wrapper
                                chunk-state={chunkState}
                                chunk-options={chunkOptions.value}
                                v-model:faseNode={faseNode.value}
                            ></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="sms" display-directive="show" tab={<common-base-tab-title title="短信应用" icon={<Chat />} />}>
                            <crm-consumer-context-sms-wrapper v-model:faseNode={faseNode.value}></crm-consumer-context-sms-wrapper>
                        </n-tab-pane>
                        <n-tab-pane
                            name="mail"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title title="邮件应用" icon={<Email />} />}
                        >
                            <crm-consumer-context-mail-wrapper></crm-consumer-context-mail-wrapper>
                        </n-tab-pane>
                        <n-tab-pane
                            name="whatsapp"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title title="社媒应用" icon={<local-nest-whatsapp />} />}
                        >
                            <crm-consumer-context-whatsapp-wrapper></crm-consumer-context-whatsapp-wrapper>
                        </n-tab-pane>
                        <n-tab-pane
                            name="deploy"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title title="基础配置" icon={<SettingsServices />} />}
                        >
                            <crm-consumer-context-basic-wrapper></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane
                            name="attachment"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title title="附件信息" icon={<CloudServices />} />}
                        >
                            <crm-consumer-context-attachment-wrapper></crm-consumer-context-attachment-wrapper>
                        </n-tab-pane>
                        <n-tab-pane
                            name="daily"
                            display-directive="show:lazy"
                            tab={<common-base-tab-title title="操作日志" icon={<ChangeCatalog />} />}
                        >
                            <crm-consumer-context-daily-wrapper></crm-consumer-context-daily-wrapper>
                        </n-tab-pane>
                    </n-tabs>
                </common-base-element>
            </crm-consumer-context-skeleton>
        )
    }
})
</script>

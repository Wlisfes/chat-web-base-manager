<script lang="tsx">
import { defineComponent } from 'vue'
import { useBaseService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { fetchDelay } from '@/utils'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumerContextDecomposer',
    inheritAttrs: false,
    props: {
        /**客户ID**/
        keyId: { type: [String, Number] }
    },
    setup(props) {
        /**客户静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            immediate: true
        })
        /**注册来源字典枚举**/
        const { chunkState: sourceChunkState } = useChunkService(e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }), {
            immediate: true,
            types: ['CHUNK_CRM_CRM_USER_SOURCE']
        })
        const { faseNode, faseState, setState } = useBaseService(
            () => Service.httpBaseCrmUserResolver({ keyId: props.keyId }),
            {
                immediate: true,
                // 本地静态枚举已废弃，待切换为后端枚举接口
                // chunkNames: {
                // CHUNK_CONSUMER_SMS_TYPE: true,
                // CHUNK_CONSUMER_SMS_STATUS: true,
                // CHUNK_CONSUMER_PAY_MODE: true,
                // CHUNK_CONSUMER_AUTH_STATUS: true,
                // CHUNK_CONSUMER_SOURCE: true,
                // CHUNK_CONSUMER_STATUS: true,
                // CHUNK_CONSUMER_CLASS: true,
                // CHUNK_CONSUMER_STAGE: true
                // },
                options: { tabName: 'sms' }
            }
        )

        return () => (
            <crm-consumer-context-skeleton initialize={faseState.initialize}>
                <common-base-element class="flex flex-col flex-1 gap-14 p-inline-14 p-block-14">
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
                        <n-tab-pane name="basic" tab="详情信息" display-directive="show">
                            <crm-consumer-context-basic-wrapper
                                chunk-options={chunkOptions.value}
                                source-options={sourceChunkState.CHUNK_CRM_CRM_USER_SOURCE.options}
                                v-model:faseNode={faseNode.value}
                            ></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="sms" tab="短信应用" display-directive="show">
                            <crm-consumer-context-sms-wrapper
                                // 本地静态枚举已废弃，待切换为后端枚举接口: chunk-state={chunkState}
                                v-model:faseNode={faseNode.value}
                            ></crm-consumer-context-sms-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="mail" tab="邮件应用" display-directive="show">
                            <crm-consumer-context-mail-wrapper></crm-consumer-context-mail-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="whatsapp" tab="社媒应用" display-directive="show">
                            <crm-consumer-context-whatsapp-wrapper></crm-consumer-context-whatsapp-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="deploy" tab="配置" display-directive="show">
                            <crm-consumer-context-basic-wrapper></crm-consumer-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="attachment" tab="附件" display-directive="show">
                            <crm-consumer-context-attachment-wrapper></crm-consumer-context-attachment-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="daily" tab="日志" display-directive="show">
                            <crm-consumer-context-daily-wrapper></crm-consumer-context-daily-wrapper>
                        </n-tab-pane>
                    </n-tabs>
                </common-base-element>
            </crm-consumer-context-skeleton>
        )
    }
})
</script>

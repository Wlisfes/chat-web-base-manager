<script lang="tsx">
import { defineComponent } from 'vue'
import { useBaseService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { fetchDelay } from '@/utils'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmClientContextDecomposer',
    inheritAttrs: false,
    props: {
        /**客户ID**/
        keyId: { type: [String, Number] }
    },
    setup(props) {
        const { faseNode, faseState, chunkState, setState } = useBaseService({
            request: () => Service.httpBaseCrmClientResolver({ keyId: props.keyId }),
            immediate: true,
            chunkNames: {
                CHUNK_CLIENT_SMS_TYPE: true,
                CHUNK_CLIENT_SMS_STATUS: true,
                CHUNK_CLIENT_PAY_MODE: true,
                CHUNK_CLIENT_AUTH_STATUS: true,
                CHUNK_CLIENT_SOURCE: true,
                CHUNK_CLIENT_STATUS: true,
                CHUNK_CLIENT_CLASS: true,
                CHUNK_CLIENT_STAGE: true
            },
            options: { tabName: 'sms' }
        })

        return () => (
            <crm-client-context-skeleton initialize={faseState.initialize}>
                <common-element class="flex flex-col flex-1 gap-14 p-inline-14 p-block-14">
                    <crm-client-context-wrapper
                        initialize={faseState.initialize}
                        chunk-state={chunkState}
                        v-model:faseNode={faseNode.value}
                    ></crm-client-context-wrapper>
                    <n-tabs
                        animated
                        type="line"
                        tabs-padding={14}
                        class="common-element-tabser inset-absolute flex-1 overflow-hidden "
                        v-model:value={faseState.tabName}
                    >
                        <n-tab-pane name="basic" tab="详情信息" display-directive="show">
                            <crm-client-context-basic-wrapper
                                chunk-state={chunkState}
                                v-model:faseNode={faseNode.value}
                            ></crm-client-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="sms" tab="短信应用" display-directive="show">
                            <crm-client-context-sms-wrapper
                                chunk-state={chunkState}
                                v-model:faseNode={faseNode.value}
                            ></crm-client-context-sms-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="mail" tab="邮件应用" display-directive="show">
                            <crm-client-context-mail-wrapper></crm-client-context-mail-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="whatsapp" tab="社媒应用" display-directive="show">
                            <crm-client-context-whatsapp-wrapper></crm-client-context-whatsapp-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="deploy" tab="配置" display-directive="show">
                            <crm-client-context-basic-wrapper></crm-client-context-basic-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="attachment" tab="附件" display-directive="show">
                            <crm-client-context-attachment-wrapper></crm-client-context-attachment-wrapper>
                        </n-tab-pane>
                        <n-tab-pane name="daily" tab="日志" display-directive="show">
                            <crm-client-context-daily-wrapper></crm-client-context-daily-wrapper>
                        </n-tab-pane>
                    </n-tabs>
                </common-element>
            </crm-client-context-skeleton>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent, Fragment, PropType } from 'vue'
import { useVModels } from '@vueuse/core'
import { useColumnService } from '@/hooks'
import { Chat } from '@vicons/carbon'
import { openCrmSmsApplicationCreate } from '@/components/crm/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumerContextSmsWrapper',
    emits: ['update:faseNode'],
    props: {
        /**枚举对象**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**详情数据**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)
        /**短信应用列表**/
        const { state, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseCrmColumnSmsApplication(payload),
            formState: { consumerKeyId: faseNode.value.keyId },
            immediate: true
        })

        /**添加短信应用**/
        async function fetchCreateSmsAppApplication() {
            return await openCrmSmsApplicationCreate({
                title: '添加短信应用',
                command: 'CREATE',
                node: { consumerKeyId: faseNode.value.keyId }
            })
        }

        return () => (
            <common-element-scrollbar class="crm-consumer-context-sms-wrapper">
                <crm-consumer-context-sms-skeleton initialize={state.initialize}>
                    <common-element is-white class="flex flex-col flex-1 overflow-hidden">
                        <common-element-columns-template class="gap-14 p-14" type="auto-fill" number={360}>
                            {state.total > 0 && (
                                <Fragment>
                                    {state.dataSource.map(item => (
                                        <n-card key={item.keyId} content-class="flex flex-col p-0! overflow-hidden">
                                            <div class="flex gap-x-10 p-inline-14 p-block-14 overflow-hidden">
                                                <common-element-alert-wrapper class="p-10" type="info">
                                                    <n-icon size={28} color="var(--n-icon-color)">
                                                        <Chat />
                                                    </n-icon>
                                                </common-element-alert-wrapper>
                                                <div class="flex flex-col flex-1 gap-y-2 overflow-hidden">
                                                    <n-text class="text-16 line-height-24" depth={1}>
                                                        {item.appAlias ?? '-'}
                                                    </n-text>
                                                    <n-text class="line-height-22" depth={3}>
                                                        应用别名
                                                    </n-text>
                                                </div>
                                                <div class="m-be-auto flex items-center">
                                                    <common-database-table-chunk
                                                        element="chunk"
                                                        value={item.type}
                                                        options={props.chunkState.CHUNK_CONSUMER_SMS_TYPE}
                                                    ></common-database-table-chunk>
                                                </div>
                                            </div>
                                            <div class="flex flex-col gap-y-10 p-inline-14 p-be-14 overflow-hidden">
                                                <common-element-columns-wrapper label-class="w-5.2em m-ie-10" label="应用ID">
                                                    <n-ellipsis tooltip={false}>{item.appId ?? '-'}</n-ellipsis>
                                                </common-element-columns-wrapper>
                                                <common-element-columns-wrapper label-class="w-5.2em m-ie-10" label="应用名称">
                                                    <n-ellipsis tooltip={false}>{item.appName ?? '-'}</n-ellipsis>
                                                </common-element-columns-wrapper>
                                                <common-element-columns-wrapper label-class="w-5.2em m-ie-10" label="应用状态">
                                                    <common-database-table-chunk
                                                        element="chunk"
                                                        value={item.status}
                                                        options={props.chunkState.CHUNK_CONSUMER_SMS_STATUS}
                                                    ></common-database-table-chunk>
                                                </common-element-columns-wrapper>
                                                <common-element-columns-wrapper label-class="w-5.2em m-ie-10" label="备注">
                                                    <n-ellipsis tooltip={false}>{item.remark ?? '-'}</n-ellipsis>
                                                </common-element-columns-wrapper>
                                            </div>
                                        </n-card>
                                    ))}
                                </Fragment>
                            )}
                            <n-card content-class="flex flex-col p-0! overflow-hidden">
                                <common-element-alert-wrapper bordered={false} type="default">
                                    <div class="h-208 box-border flex flex-col p-14 items-center justify-center">
                                        <common-element-button class="p-10" text type="primary" onClick={fetchCreateSmsAppApplication}>
                                            <common-element-icon size={18}>
                                                <local-nest-plus />
                                            </common-element-icon>
                                            <span class="text-16 p-is-5">添加应用</span>
                                        </common-element-button>
                                        <n-text depth="3">已添加应用数：0，还可添加应用数：1</n-text>
                                    </div>
                                </common-element-alert-wrapper>
                            </n-card>
                        </common-element-columns-template>
                    </common-element>
                </crm-consumer-context-sms-skeleton>
            </common-element-scrollbar>
        )
    }
})
</script>

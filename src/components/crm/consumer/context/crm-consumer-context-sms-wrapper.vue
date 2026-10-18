<script lang="tsx">
import { defineComponent, Fragment, Component, h, PropType } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import { Chat, ChatBot, ChatLaunch } from '@vicons/carbon'
import { useVModels } from '@vueuse/core'
import * as feedback from '@/components/crm/hooks'
import * as Service from '@/api/instance.service'

/**短信应用类型对应的图标；颜色统一使用枚举接口返回的 type。*/
const SMS_APP_ICONS: Record<string, Component> = {
    MRKT: ChatBot,
    NTFY: ChatLaunch,
    SOTP: Chat
}

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
        /**短信应用静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseCrmSmsAppEnums(), {
            immediate: true
        })
        /**短信应用列表**/
        const { state, fetchRefresh } = useColumnService((base, payload) => Service.httpBaseCrmColumnSmsApp(payload), {
            formState: { userKeyId: faseNode.value.keyId },
            immediate: true
        })

        /**添加短信应用**/
        async function fetchCrmSmsAppStore() {
            return await feedback.fetchCrmSmsAppStore({
                title: '添加短信应用',
                faseNode: faseNode.value,
                onSubmit: () => fetchRefresh()
            })
        }

        return () => (
            <crm-consumer-context-sms-skeleton initialize={state.initialize}>
                <common-base-scrollbar class="crm-consumer-context-sms-wrapper">
                    <common-base-columns-template class="gap-14 p-14" type="auto-fill" number={360}>
                        {state.total > 0 && (
                            <Fragment>
                                {state.dataSource.map((item: Omix) => (
                                    <n-card key={item.keyId} content-class="flex flex-col p-0! overflow-hidden">
                                        <div class="flex gap-x-10 p-inline-14 p-block-14 overflow-hidden">
                                            <common-base-alert-wrapper
                                                class="p-10"
                                                type="info"
                                                value={item.type}
                                                items={chunkOptions.value.typeOptions}
                                            >
                                                <n-icon size={28} color="var(--n-icon-color)">
                                                    {h(SMS_APP_ICONS[item.type] ?? Chat)}
                                                </n-icon>
                                            </common-base-alert-wrapper>
                                            <div class="flex flex-col flex-1 gap-y-2 overflow-hidden">
                                                <n-text class="text-16 line-height-24" depth={1}>
                                                    {item.appAlias ?? '-'}
                                                </n-text>
                                                <n-text class="line-height-22" depth={3}>
                                                    应用别名
                                                </n-text>
                                            </div>
                                            <div class="m-be-auto flex items-center">
                                                <common-base-chunk
                                                    value={item.type}
                                                    items={chunkOptions.value.typeOptions}
                                                ></common-base-chunk>
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-y-10 p-inline-14 p-be-14 overflow-hidden">
                                            <common-base-columns-wrapper label-class="w-4.2em m-ie-10" label="应用ID">
                                                <n-ellipsis tooltip={false}>{item.appId ?? '-'}</n-ellipsis>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.2em m-ie-10" label="应用名称">
                                                <n-ellipsis tooltip={false}>{item.appName ?? '-'}</n-ellipsis>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.2em m-ie-10" label="应用状态">
                                                <common-base-chunk
                                                    value={item.status}
                                                    items={chunkOptions.value.statusOptions}
                                                ></common-base-chunk>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.2em m-ie-10" label="备注">
                                                <n-ellipsis tooltip={false}>{item.remark ?? '-'}</n-ellipsis>
                                            </common-base-columns-wrapper>
                                        </div>
                                    </n-card>
                                ))}
                            </Fragment>
                        )}
                        <n-card content-class="flex flex-col p-0! overflow-hidden">
                            <div class="box-border flex flex-col flex-1 p-14 min-h-216 items-center justify-center">
                                <common-base-button class="p-10" text type="primary" onClick={fetchCrmSmsAppStore}>
                                    <common-base-icon size={18}>
                                        <local-nest-plus />
                                    </common-base-icon>
                                    <span class="text-16 p-is-5">添加应用</span>
                                </common-base-button>
                                <n-text depth="3">{`已添加应用数：${state.total}，还可添加应用数：${(faseNode.value.config?.smsAppLimit ?? 0) - state.total}`}</n-text>
                            </div>
                        </n-card>
                    </common-base-columns-template>
                </common-base-scrollbar>
            </crm-consumer-context-sms-skeleton>
        )
    }
})
</script>

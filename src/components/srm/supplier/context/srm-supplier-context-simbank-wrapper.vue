<script lang="tsx">
import { defineComponent, Fragment, PropType } from 'vue'
import { useColumnService, useChunkService, pick } from '@/hooks'
import { Chip } from '@vicons/carbon'
import { useVModels } from '@vueuse/core'
import * as feedback from '@/components/srm/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSupplierContextSimbankWrapper',
    emits: ['update:faseNode'],
    props: {
        /**字典枚举：CHUNK_SRM_SIMBANK_MODEL 设备型号**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**供应商详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)
        /**SIMBANK 设备静态枚举**/
        const { chunkOptions } = useChunkService(e => Service.httpBaseSrmSimbankEnums(), {
            immediate: true
        })
        /**SIMBANK 设备列表：卡片展示不分页，单次最多加载 300 台**/
        const { state, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnSimbank({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                formState: { userKeyId: faseNode.value.keyId },
                immediate: true
            }
        )

        /**新增 SIMBANK 设备**/
        async function fetchCreateSimbank() {
            return await feedback.fetchSrmSupplierSimbank({
                title: '新增设备',
                faseNode: faseNode.value,
                onSubmit: () => fetchRefresh()
            })
        }

        return () => (
            <srm-supplier-context-simbank-skeleton initialize={state.initialize}>
                <common-base-scrollbar class="srm-supplier-context-simbank-wrapper">
                    <common-base-columns-template class="gap-14 p-14" type="auto-fill" number={360}>
                        {state.total > 0 && (
                            <Fragment>
                                {state.dataSource.map((item: Omix) => (
                                    <n-card key={item.keyId} content-class="flex flex-col p-0! overflow-hidden">
                                        <div class="flex gap-x-10 p-inline-14 p-block-14 overflow-hidden">
                                            <common-base-alert-wrapper
                                                class="p-10"
                                                type="default"
                                                value={item.online}
                                                items={chunkOptions.value.onlineOptions}
                                            >
                                                <n-icon size={28} color="var(--n-icon-color)">
                                                    <Chip />
                                                </n-icon>
                                            </common-base-alert-wrapper>
                                            <div class="flex flex-col flex-1 gap-y-2 overflow-hidden">
                                                <n-ellipsis class="text-16 line-height-24" tooltip={false}>
                                                    {item.alias ?? '-'}
                                                </n-ellipsis>
                                                <n-text class="line-height-22" depth={3}>
                                                    设备别名
                                                </n-text>
                                            </div>
                                            <div class="m-be-auto flex items-center">
                                                <common-base-chunk
                                                    value={item.online}
                                                    items={chunkOptions.value.onlineOptions}
                                                ></common-base-chunk>
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-y-10 p-inline-14 p-be-14 overflow-hidden">
                                            <common-base-columns-wrapper label-class="w-4.6em m-ie-10" label="设备名称">
                                                <n-ellipsis tooltip={false}>{item.name ?? '-'}</n-ellipsis>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.6em m-ie-10" label="设备ID">
                                                <n-ellipsis tooltip={false}>{item.keyId ?? '-'}</n-ellipsis>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.6em m-ie-10" label="设备型号">
                                                <common-base-chunk
                                                    value={item.model}
                                                    items={props.chunkState.CHUNK_SRM_SIMBANK_MODEL?.options}
                                                ></common-base-chunk>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.6em m-ie-10" label="MAC地址">
                                                <n-ellipsis tooltip={false}>{item.mac ?? '-'}</n-ellipsis>
                                            </common-base-columns-wrapper>
                                            <common-base-columns-wrapper label-class="w-4.6em m-ie-10" label="设备状态">
                                                <common-base-chunk
                                                    value={item.status}
                                                    items={chunkOptions.value.statusOptions}
                                                ></common-base-chunk>
                                            </common-base-columns-wrapper>
                                        </div>
                                    </n-card>
                                ))}
                            </Fragment>
                        )}
                        <n-card content-class="flex flex-col p-0! overflow-hidden">
                            <div class="box-border flex flex-col flex-1 p-14 min-h-216 items-center justify-center">
                                <common-base-button class="p-10" text type="primary" onClick={fetchCreateSimbank}>
                                    <common-base-icon size={18}>
                                        <local-nest-plus />
                                    </common-base-icon>
                                    <span class="text-16 p-is-5">添加 simbank 设备</span>
                                </common-base-button>
                                <n-text depth="3">{`已添加设备数：${state.total}，还可添加设备数：${(faseNode.value.config?.simbankLimit ?? 0) - state.total}`}</n-text>
                            </div>
                        </n-card>
                    </common-base-columns-template>
                </common-base-scrollbar>
            </srm-supplier-context-simbank-skeleton>
        )
    }
})
</script>

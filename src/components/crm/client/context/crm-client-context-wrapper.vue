<script lang="tsx">
import { defineComponent, ref, PropType } from 'vue'
import { useVModels } from '@vueuse/core'
import { Observer, fetchNumCurrency } from '@/utils'
import { useColumnService, useState, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/finance/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmClientContextWrapper',
    emits: ['update:faseNode'],
    props: {
        /**初始化执行中**/
        initialize: { type: Boolean, default: true },
        /**客户详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**枚举对象信息**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)

        return () => (
            <n-card class="crm-client-context-wrapper flex flex-col" content-class="p-16! flex flex-col gap-10">
                <div class="flex flex-col overflow-hidden">
                    <div class="flex justify-between gap-20 overflow-hidden">
                        <div class="flex flex-col overflow-hidden">
                            <div class="flex gap-20 text-12 line-height-16 overflow-hidden">
                                <n-text depth="3">{`创建时间：${faseNode.value.createTime ?? '-'}`}</n-text>
                            </div>
                            <div class="flex items-center p-block-8 gap-10 overflow-hidden">
                                <n-h1 class="m-0 text-20 font-500 line-height-24">{`${faseNode.value.name} (${faseNode.value.keyId})`}</n-h1>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <n-button>刷新</n-button>
                        </div>
                    </div>
                    <div class="flex gap-20 text-12 line-height-16 overflow-hidden">
                        <n-text depth="3">{`归属人：${fetchNumCurrency(faseNode.value.user?.name, faseNode.value.user?.number)}`}</n-text>
                    </div>
                </div>
                <common-business-progressbar
                    initialize={props.initialize}
                    stage={faseNode.value.stage}
                    items={props.chunkState.CHUNK_CLIENT_STAGE}
                ></common-business-progressbar>
            </n-card>
        )
    }
})
</script>

<style lang="scss" scoped>
.crm-client-context-progressbar {
    position: relative;
    // .common-block {
    //     position: relative;
    //     &:first-child {
    //         margin-inline-start: 0;
    //         clip-path: polygon(0% 0%, 93% 0%, 100% 50%, 93% 100%, 0% 100%);
    //     }
    //     &:last-child {
    //         clip-path: polygon(100% 0, 100% 100%, 0% 100%, 7% 50%, 0% 0%);
    //     }
    //     &:not(:first-child):not(:last-child) {
    //         clip-path: polygon(93% 0%, 100% 50%, 93% 100%, 0% 100%, 7% 50%, 0% 0%);
    //     }
    // }
}
</style>

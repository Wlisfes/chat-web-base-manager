<script lang="tsx">
import { defineComponent, ref, computed, Fragment, PropType } from 'vue'
import { useVModels, useIntersectionObserver } from '@vueuse/core'
import { Lightning, Chat, ChatBot, Time, UserAdmin, Currency, Building } from '@vicons/carbon'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'CrmConsumerContextWrapper',
    emits: ['update:faseNode'],
    props: {
        /**初始化执行中**/
        initialize: { type: Boolean, default: true },
        /**客户详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**客户静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)

        return () => (
            <common-base-element is-white class="flex flex-col p-inline-16 p-bs-16 p-be-10 overflow-hidden">
                <div class="flex items-center p-be-10 overflow-hidden">
                    <div class="flex flex-col flex-1 gap-y-10 overflow-hidden">
                        <div class="flex gap-10 overflow-hidden">
                            <n-h1 class="m-0 text-20 font-500 line-height-24">{`${faseNode.value.name} (${faseNode.value.keyId})`}</n-h1>
                            <common-base-chunk
                                mode="chunk"
                                round
                                value={faseNode.value.classType}
                                items={props.chunkOptions.classTypeOptions}
                            ></common-base-chunk>
                            <common-base-chunk
                                mode="chunk"
                                value={faseNode.value.authStatus}
                                items={props.chunkOptions.authStatusOptions}
                            ></common-base-chunk>
                        </div>
                        <div class="flex gap-x-20 text-12 line-height-16 overflow-hidden">
                            <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                <n-icon size={14} component={<Time />} />
                                <span>{`创建时间：${faseNode.value.createTime ?? '-'}`}</span>
                            </n-text>
                            <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                <n-icon size={14} component={<UserAdmin />} />
                                <common-base-user prefix="归属人：" data={faseNode.value.ownerUserUidOptions}></common-base-user>
                            </n-text>
                            {(faseNode.value.ownerUserUidOptions?.organizations ?? []).length > 0 && (
                                <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                    <n-icon size={14} component={<Building />} />
                                    <span>{`部门：${faseNode.value.ownerUserUidOptions.organizations.map((e: Omix) => e.name).join('、')}`}</span>
                                </n-text>
                            )}
                            <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                <n-icon size={14} component={<Currency />} />
                                <span>{`币种：${faseNode.value.currency ?? '-'}`}</span>
                            </n-text>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <n-button>刷新</n-button>
                        <n-button>编辑客户</n-button>
                    </div>
                </div>
                <common-business-progressbar
                    initialize={props.initialize}
                    stage={faseNode.value.stage}
                    items={props.chunkOptions.stageOptions}
                ></common-business-progressbar>
            </common-base-element>
        )

        // const { state, setState } = useState({ stuck: false })
        // /**吸顶哨兵节点**/
        // const sentinel = ref<HTMLElement>()
        // /**获取滚动节点**/
        // const scrollRoot = computed(() => {
        //     return sentinel.value?.closest<HTMLElement>('.n-scrollbar-container')
        // })
        // useIntersectionObserver(sentinel, fetchSentinelObserver, { root: scrollRoot })
        // async function fetchSentinelObserver([entry]: Array<Omix>) {
        //     return await setState({ stuck: !entry.isIntersecting })
        // }

        // return () => (
        //     <Fragment>
        //         <div ref={sentinel} class="h-0"></div>
        //         <div class={{ 'sticky top-0 z-2': true, [state.stuck ? 'is-stuck' : 'p-inline-14 p-bs-14']: true }}>
        //             <common-base-element
        //                 is-white
        //                 class={{ 'p-inline-14 p-bs-14': true, 'is-stuck p-block-14! common-skyline--bottom': state.stuck }}
        //             >
        //                 <div class="flex justify-between gap-x-20">
        //                     <div class="flex items-center gap-10 overflow-hidden">
        //                         <n-h1 class="m-0 text-20 font-500 line-height-24">{`${faseNode.value.name} (${faseNode.value.keyId})`}</n-h1>
        //                     </div>
        //                     <div class="flex items-center">
        //                         <n-button size="small">刷新</n-button>
        //                     </div>
        //                 </div>
        //             </common-base-element>
        //         </div>
        //         <common-base-element is-white class="flex flex-col gap-y-10 m-inline-14 p-inline-14 p-be-14 p-bs-10">
        //             <div class="flex gap-x-20 text-12 line-height-16 overflow-hidden">
        //                 <n-text depth="3">{`创建时间：${faseNode.value.createTime ?? '-'}`}</n-text>
        //                 <n-text depth="3">
        //                     <span>归属人：</span>
        //                     <common-base-user element="text" data={faseNode.value.ownerUserUidOptions}></common-base-user>
        //                 </n-text>
        //             </div>
        //             <common-business-progressbar
        //                 initialize={props.initialize}
        //                 stage={faseNode.value.stage}
        //                 items={props.chunkOptions.stageOptions}
        //             ></common-business-progressbar>
        //         </common-base-element>
        //     </Fragment>
        // )
    }
})
</script>

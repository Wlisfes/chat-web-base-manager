<script lang="tsx">
import { defineComponent, ref, computed, Fragment, PropType, onMounted } from 'vue'
import { useVModels, useIntersectionObserver } from '@vueuse/core'
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
        const { state, setState } = useState({ stuck: false })
        /**吸顶哨兵节点**/
        const sentinel = ref<HTMLElement>()
        /**获取滚动节点**/
        const scrollRoot = computed(() => {
            return sentinel.value?.closest<HTMLElement>('.n-scrollbar-container')
        })
        useIntersectionObserver(sentinel, fetchSentinelObserver, { root: scrollRoot })
        async function fetchSentinelObserver([entry]: Array<Omix>) {
            return await setState({ stuck: !entry.isIntersecting })
        }

        return () => (
            <Fragment>
                <div ref={sentinel} class="h-0"></div>
                <div class={{ 'sticky top-0 z-1': true, [state.stuck ? 'is-stuck' : 'p-inline-14 p-bs-14']: true }}>
                    <common-base-element
                        is-white
                        class={{ 'p-inline-14 p-bs-14': true, 'is-stuck p-block-14! common-skyline--bottom': state.stuck }}
                    >
                        <div class="flex justify-between gap-x-20">
                            <div class="flex items-center gap-10 overflow-hidden">
                                <n-h1 class="m-0 text-20 font-500 line-height-24">{`${faseNode.value.name} (${faseNode.value.keyId})`}</n-h1>
                            </div>
                            <div class="flex items-center">
                                <n-button size="small">刷新 {state.stuck ? '1' : '0'}</n-button>
                            </div>
                        </div>
                    </common-base-element>
                </div>
                <common-base-element is-white class="flex flex-col gap-y-10 m-inline-14 p-inline-14 p-be-14 p-bs-10">
                    <div class="flex gap-x-20 text-12 line-height-16 overflow-hidden">
                        <n-text depth="3">{`创建时间：${faseNode.value.createTime ?? '-'}`}</n-text>
                        <n-text depth="3">
                            <span>归属人：</span>
                            <common-base-user element="text" data={faseNode.value.ownerUserUidOptions}></common-base-user>
                        </n-text>
                    </div>
                    <common-business-progressbar
                        initialize={props.initialize}
                        stage={faseNode.value.stage}
                        items={props.chunkOptions.stageOptions}
                    ></common-business-progressbar>
                </common-base-element>
            </Fragment>
        )
    }
})
</script>

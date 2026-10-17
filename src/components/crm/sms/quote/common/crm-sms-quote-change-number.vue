<script lang="tsx">
import { defineComponent, computed, PropType } from 'vue'
import { fetchNotifyService } from '@/plugins'
import { useVModels } from '@vueuse/core'
import { useState } from '@/hooks'
import { isEmpty } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteChangeNumber',
    emits: ['update:node'],
    props: {
        /**类型**/
        mode: { type: String as PropType<'downUsd' | 'upUsd'>, required: true },
        /**对接节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { node } = useVModels(props, emit)
        const { state, setState } = useState({ loading: false, value: node.value[props.mode] })
        /**现行报价原价；当前应用无该方向报价时为空**/
        const amount = computed(() => node.value[props.mode === 'upUsd' ? 'existingUpUsd' : 'existingDownUsd'])
        /**内容渲染**/
        const change = computed(() => {
            return `原价：<span class="text-[var(--primary-color)]">${isEmpty(amount.value) ? '-' : amount.value}</span> / 条`
        })
        /**金额**/
        async function fetchChnageNumber() {
            if (isEmpty(state.value) || Number(state.value) === node.value[props.mode]) {
                /**金额一致无需修改**/
                return await setState({ value: node.value[props.mode] })
            }
            return await setState({ loading: true }).then(async () => {
                node.value.loading = true
                try {
                    return await Service.httpBaseCrmUpdateSmsQuoteDraft({
                        keyId: node.value.keyId,
                        [props.mode]: state.value
                    }).then(async ({ data }) => {
                        return await setState({ loading: false }).then(async () => {
                            /**回写最新价格与变更状态（增长/降低/未变）**/
                            Object.assign(node.value, data, { loading: false })
                            return await fetchNotifyService({ type: 'success', title: '操作成功' })
                        })
                    })
                } catch (err) {
                    node.value.loading = false
                    return await setState({ loading: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }
        return () => (
            <div class="flex items-center gap-x-10 overflow-hidden">
                <form-base-number-input
                    class="flex-1 overflow-hidden"
                    min={0}
                    step={0.01}
                    precision={6}
                    show-button={false}
                    loading={state.loading}
                    disabled={state.loading || node.value.status === 'deleted'}
                    v-model:value={state.value}
                    on-blur={fetchChnageNumber}
                ></form-base-number-input>
                <div class="whitespace-nowrap min-w-150 overflow-hidden" v-html={change.value}></div>
            </div>
        )
    }
})
</script>

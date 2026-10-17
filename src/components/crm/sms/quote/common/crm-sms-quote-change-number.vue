<script lang="tsx">
import { defineComponent, PropType } from 'vue'
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
                            node.value.loading = false
                            node.value[props.mode] = state.value
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
            <form-base-number-input
                class="w-full"
                min={0}
                step={0.000001}
                precision={6}
                disabled={node.value.status === 'deleted'}
                v-model:value={state.value}
                on-blur={fetchChnageNumber}
            ></form-base-number-input>
        )
    }
})
</script>

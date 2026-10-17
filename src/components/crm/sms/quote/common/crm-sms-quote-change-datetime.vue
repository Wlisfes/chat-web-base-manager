<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { fetchNotifyService } from '@/plugins'
import { useState, moment } from '@/hooks'
import { useVModels } from '@vueuse/core'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmSmsQuoteChangeDatetime',
    emits: ['update:node'],
    props: {
        /**对接节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { node } = useVModels(props, emit)
        const { state, setState } = useState({ loading: false })

        /**时间变更**/
        async function fetchChnageDateTime(keyId: number, effectiveTime: string) {
            return await setState({ loading: true }).then(async () => {
                node.value.loading = true
                try {
                    return await Service.httpBaseCrmUpdateSmsQuoteDraft({ keyId, effectiveTime }).then(async ({ data }) => {
                        return await setState({ loading: false }).then(async () => {
                            node.value.loading = false
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
            <form-base-date-picker
                type="datetime"
                clearable={false}
                placement="left-start"
                placeholder="请选择生效时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                loading={state.loading}
                v-model:formatted-value={node.value.effectiveTime}
                disabled={state.loading || node.value.status === 'deleted'}
                is-date-disabled={(time: number) => time > moment().add(30, 'day').endOf('day').valueOf()}
                on-confirm={(time: number, date: string) => fetchChnageDateTime(node.value.keyId, date)}
            />
        )
    }
})
</script>

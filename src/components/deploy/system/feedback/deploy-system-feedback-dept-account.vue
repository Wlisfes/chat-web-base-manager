<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import { isNotEmpty } from 'class-validator'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackDeptAccount',
    emits: ['close'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**部门数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**通用字典枚举**/
        const chunkOptions = useChunkService({ type: ['CHUNK_ACCOUNT_STATUS'] })
        /**表格实例**/
        const { state, instOptions, setState, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSystemColumnAccount(payload),
            formState: { depts: [props.node.keyId].filter(isNotEmpty) },
            limit: 0,
            size: 100,
            columns: [
                { title: '头像', key: 'avatar', width: 60, align: 'center', disabled: true },
                { title: '名称', key: 'name', width: 120, disabled: true },
                { title: '职级', key: 'ranks', width: 100, check: true },
                { title: '职位', key: 'positions', width: 160, check: true },
                { title: '状态', key: 'status', width: 100, align: 'center', check: true },
                { title: '手机号', key: 'phone', width: 160, check: true },
                { title: '邮箱', key: 'email', width: 220, check: true },
                { title: '入职时间', key: 'createTime', width: 160, check: true }
            ]
        })

        return () => (
            <common-dialog-provider
                title={props.title}
                action={false}
                width={1280}
                v-model:visible={state.visible}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-element class="h-90vh max-h-640 flex flex-col p-be-20 overflow-hidden">
                    <common-database-table
                        pagination={false}
                        limit={state.limit}
                        total={state.total}
                        columns={state.columns}
                        v-model:page={state.page}
                        v-model:size={state.size}
                        v-model:select={state.select}
                        v-model:data={state.dataSource}
                        v-model:loading={state.loading}
                        v-model:initialize={state.initialize}
                        v-model:customize={state.customize}
                        on-update:customize={instOptions.fetchUpdateCustomize}
                        on-update:page={(page: number) => fetchRefresh({ page })}
                        on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                    >
                        {{
                            col_name: (data: Omix) => {
                                return <common-database-table-user element="text" data={data}></common-database-table-user>
                            },
                            col_avatar: (data: Omix) => {
                                return <common-database-table-user element="avatar" data={data}></common-database-table-user>
                            },
                            col_positions: (data: Omix) => (
                                <common-database-table-content
                                    value={(data.positions ?? []).map((item: Omix) => item.name)}
                                ></common-database-table-content>
                            ),
                            col_ranks: (data: Omix) => (
                                <common-database-table-content
                                    value={(data.ranks ?? []).map((item: Omix) => item.name)}
                                ></common-database-table-content>
                            ),
                            col_status: (data: Omix) => (
                                <common-database-table-chunk
                                    element="chunk"
                                    value={data.status}
                                    options={chunkOptions.CHUNK_ACCOUNT_STATUS.value}
                                ></common-database-table-chunk>
                            )
                        }}
                    </common-database-table>
                </common-element>
            </common-dialog-provider>
        )
    }
})
</script>

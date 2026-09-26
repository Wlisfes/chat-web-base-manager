<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployChunkFeedbackManager',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**系统枚举静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        console.log(props.node)
        /**表格实例**/
        const { state, instOptions, setState, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSkylineColumnChunk({ ...payload, page: base.page, size: base.size }),
            limit: 0,
            formState: {
                /**枚举模块**/
                module: props.node.module,
                /**枚举类型**/
                type: props.node.type,
                /**枚举项名称**/
                name: undefined,
                /**状态**/
                status: undefined
            },
            columns: [
                { title: 'ID', key: 'keyId', width: 100, disabled: true },
                { title: 'PID', key: 'pid', width: 100, disabled: true },
                { title: '名称', key: 'name', minWidth: 120, disabled: true },
                { title: '业务值', key: 'value', minWidth: 120 },
                { title: '排序号', key: 'sort', width: 100 },
                { title: '状态', key: 'status', width: 100 },
                { title: '创建人', key: 'createBy', width: 120 },
                { title: '创建时间', key: 'createTime', width: 160 },
                { title: '更新人', key: 'modifyBy', width: 120 },
                { title: '更新时间', key: 'modifyTime', width: 160 }
            ]
        })

        return () => (
            <common-dialog-provider
                title={props.title}
                width={1440}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-base-element class="h-90vh max-h-640 flex flex-col overflow-hidden">
                    <common-database-table
                        pagination-class="p-bs-14!"
                        bordered={false}
                        limit={state.limit}
                        total={state.total}
                        columns={state.columns}
                        v-model:page={state.page}
                        v-model:size={state.size}
                        v-model:data={state.dataSource}
                        v-model:loading={state.loading}
                        v-model:initialize={state.initialize}
                        v-model:customize={state.customize}
                        on-update:customize={instOptions.fetchUpdateCustomize}
                        on-update:page={(page: number) => fetchRefresh({ page })}
                        on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                    >
                        {{
                            col_status: (data: Omix) => (
                                <common-base-chunk
                                    bordered
                                    value={data.status}
                                    items={props.chunkOptions.statusOptions}
                                ></common-base-chunk>
                            )
                        }}
                    </common-database-table>
                </common-base-element>
            </common-dialog-provider>
        )
    }
})
</script>

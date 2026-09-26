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
        /**页面权限标识**/
        keyName: { type: String, required: true },
        /**系统枚举静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**表格实例**/
        const { formRef, formState, state, instOptions, setState, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSkylineColumnChunk({ ...payload, page: base.page, size: base.size }),

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
            actions: [
                { title: '编辑', key: 'update', type: 'primary', field: 'allowUpdate' },
                { title: '删除', key: 'delete', type: 'error', field: 'allowDelete' }
            ],
            columns: [
                { title: 'ID', key: 'keyId', width: 100, disabled: true },
                { title: 'PID', key: 'pid', width: 100, disabled: true },
                { title: '枚举名称', key: 'name', minWidth: 120, disabled: true },
                { title: '枚举值', key: 'value', minWidth: 120 },
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
                action={false}
                scrollbar={false}
                class-element="p-inline-8 p-be-8"
                class-name="h-90vh max-h-750"
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <common-database-search
                    class="p-bs-0!"
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'abstract']}
                    ref={formRef}
                    limit={state.limit}
                    v-model:loading={state.loading}
                    v-model:when={state.when}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-update:database={instOptions.fetchUpdateDatabase}
                    on-restore={fetchRestore}
                    on-submit={fetchRefresh}
                >
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-button type="primary">新增</common-base-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="分类名称">
                        <form-base-input
                            clearable
                            placeholder="请输入分类名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    class="p-inline-0! p-block-0!"
                    show-command
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
                            <common-base-chunk bordered value={data.status} items={props.chunkOptions.statusOptions}></common-base-chunk>
                        ),
                        col_command: (data: Omix) => (
                            <common-base-authorize
                                element
                                empty="-"
                                class="flex items-center gap-x-10"
                                value={state.actions.map(e => `${props.keyName}:${e.key}`)}
                            >
                                {state.actions.map(item => (
                                    <common-base-authorize value={`${props.keyName}:${item.key}`}>
                                        <common-base-button text type={item.type} disabled={data[item.field]}>
                                            {item.title}
                                        </common-base-button>
                                    </common-base-authorize>
                                ))}
                            </common-base-authorize>
                        )
                    }}
                </common-database-table>
            </common-dialog-provider>
        )
    }
})
</script>

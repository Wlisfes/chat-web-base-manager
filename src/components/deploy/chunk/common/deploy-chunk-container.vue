<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import { ChunkModule } from '@/interface/deploy/deploy-chunk.resolver'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployChunkContainer',
    props: {
        /**页面权限标识**/
        keyName: { type: String, required: true },
        /**枚举模块**/
        module: { type: String as PropType<ChunkModule>, required: true }
    },
    setup(props, ctx) {
        /**系统枚举静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSkylineChunkEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSkylineColumnChunkModule({ ...payload, page: base.page, size: base.size }),
            keyName: props.keyName,
            formState: {
                module: props.module,
                /**分类名称**/
                name: undefined,
                /**字段类型**/
                kind: undefined
            },
            columns: [
                { title: '分类名称', key: 'name', width: 200, disabled: true },
                { title: '字段类型', key: 'kind', width: 120, disabled: true },
                { title: '枚举数量', key: 'chunkCount', align: 'center', width: 120, disabled: true },
                { title: '备注', key: 'remark', minWidth: 220 },
                { title: '创建人', key: 'createBy', width: 120 },
                { title: '创建时间', key: 'createTime', width: 160 },
                { title: '更新人', key: 'modifyBy', width: 120 },
                { title: '更新时间', key: 'modifyTime', width: 160 }
            ]
        })

        /**查看枚举列表**/
        async function fetchDeployChunkManager(node: Omix) {
            return feedback.fetchDeployChunkManager({
                node,
                title: node.name,
                keyName: props.keyName,
                chunkOptions: chunkOptions.value
            })
        }

        return () => (
            <common-base-element class="flex flex-col flex-1 relative overflow-hidden">
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy']}
                    ref={formRef}
                    limit={state.limit}
                    v-model:loading={state.loading}
                    v-model:when={state.when}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-update:database={instOptions.fetchUpdateDatabase}
                    on-restore={fetchRestore}
                    on-submit={fetchRequest}
                >
                    <common-database-search-column disabled prop="name" label="分类名称">
                        <form-base-input
                            clearable
                            placeholder="请输入分类名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="kind" label="字段类型">
                        <form-base-select
                            clearable
                            placeholder="请选择字段类型"
                            loading={chunkState.loading}
                            options={chunkOptions.value.kindOptions}
                            v-model:value={formState.value.kind}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-settings
                    //show-command
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
                        col_chunkCount: (data: Omix) => (
                            <n-text class="cursor-pointer" type="info" underline onClick={() => fetchDeployChunkManager(data)}>
                                {data.chunkCount ?? 0}
                            </n-text>
                        ),
                        col_kind: (data: Omix) => {
                            return <common-base-chunk bordered value={data.kind} items={chunkOptions.value.kindOptions}></common-base-chunk>
                        },
                        col_createBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                        },
                        col_modifyBy: (data: Omix) => {
                            return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                        }
                    }}
                </common-database-table>
            </common-base-element>
        )
    }
})
</script>

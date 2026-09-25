<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useChunkService } from '@/hooks'
import { ChunkModule } from '@/interface/deploy/deploy-chunk.resolver'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployChunkSystem',
    setup(props, ctx) {
        /**系统枚举静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSkylineChunkEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSkylineColumnChunkModule({ ...payload, page: base.page, size: base.size }),
            keyName: 'chat:deploy:chunk:system',
            formState: {
                module: 'CHUNK_SYSTEM' as ChunkModule,
                /**分类名称**/
                name: undefined,
                /**字段类型**/
                kind: undefined
            },
            columns: [
                { title: '分类名称', key: 'name', minWidth: 160, disabled: true },
                { title: '字段类型', key: 'kind', minWidth: 120, disabled: true },
                { title: '备注', key: 'remark', minWidth: 220 },
                { title: '创建人', key: 'createBy', minWidth: 140 },
                { title: '创建时间', key: 'createTime', minWidth: 160 },
                { title: '更新人', key: 'modifyBy', minWidth: 140 },
                { title: '更新时间', key: 'modifyTime', minWidth: 160 }
            ]
        })

        /**种子数据 createBy/modifyBy 为 0 时回显系统**/
        function fetchChunkUserName(uid?: string | null) {
            if (!uid || uid === '0') return '系统'
            return uid
        }

        return () => (
            <layout-common-container initialize={state.initialize}>
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
                        col_name: (data: Omix) => (
                            <n-ellipsis title={data.name} tooltip={false}>
                                <router-link
                                    to={{
                                        path: '/deploy/chunk/system/item',
                                        query: { module: data.module, type: data.type, name: data.name }
                                    }}
                                    class="decoration-none"
                                >
                                    <n-text type="info">{data.name}</n-text>
                                </router-link>
                            </n-ellipsis>
                        ),
                        col_kind: (data: Omix) => (
                            <common-base-chunk bordered value={data.kind} items={chunkOptions.value.kindOptions}></common-base-chunk>
                        ),
                        col_createBy: (data: Omix) => <span>{fetchChunkUserName(data.createBy)}</span>,
                        col_modifyBy: (data: Omix) => <span>{fetchChunkUserName(data.modifyBy)}</span>
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useColumnService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'
import type * as Chunk from '@/interface/deploy/deploy-chunk.resolver'

export default defineComponent({
    name: 'DeployChunkSystemItem',
    setup(props, ctx) {
        const route = useRoute()
        /**从路由读取当前枚举分类**/
        function fetchRouteQuery() {
            return {
                module: (String(route.query.module ?? 'CHUNK_SYSTEM') || 'CHUNK_SYSTEM') as Chunk.ChunkModule,
                type: String(route.query.type ?? ''),
                name: String(route.query.name ?? '')
            }
        }
        /**系统枚举静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseSkylineChunkEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => {
                const query = fetchRouteQuery()
                return Service.httpBaseSkylineColumnChunk({
                    ...payload,
                    module: query.module,
                    type: query.type,
                    page: base.page,
                    size: base.size
                })
            },
            keyName: 'chat:deploy:chunk:system:item',
            formState: {
                /**枚举项名称**/
                name: undefined,
                /**状态**/
                status: undefined
            },
            columns: [
                { title: 'ID', key: 'keyId', width: 120, disabled: true },
                { title: '名称', key: 'name', minWidth: 160, disabled: true },
                { title: '业务值', key: 'value', minWidth: 140 },
                { title: '排序号', key: 'sort', width: 100 },
                { title: '状态', key: 'status', width: 100 },
                { title: '创建时间', key: 'createTime', minWidth: 160 },
                { title: '更新时间', key: 'modifyTime', minWidth: 160 }
            ]
        })

        watch(
            () => [route.query.module, route.query.type],
            async () => {
                await fetchRestore()
                return await fetchRefresh({ page: 1 })
            }
        )

        /**新增系统枚举**/
        async function fetchDeployChunkCreate() {
            const query = fetchRouteQuery()
            if (!query.type) {
                return await fetchNotifyService({ type: 'error', title: '缺少枚举类型编码' })
            }
            return await feedback.fetchDeployChunkSystem({
                title: `新增${query.name || '系统枚举'}`,
                command: 'CREATE',
                module: query.module,
                type: query.type,
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**编辑系统枚举**/
        async function fetchDeployChunkUpdate() {
            const query = fetchRouteQuery()
            const node = state.select[0] as Chunk.ChunkItem
            return await feedback.fetchDeployChunkSystem({
                title: '编辑系统枚举',
                command: 'UPDATE',
                module: query.module,
                type: query.type || node.type,
                node,
                async onSubmit() {
                    return await fetchRefresh()
                }
            })
        }

        /**删除系统枚举**/
        async function fetchDeployChunkDelete() {
            const node = state.select[0] as Chunk.ChunkItem
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认删除枚举项【${node.name}】吗？删除后无法恢复！`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSkylineDeleteChunk({ keyId: node.keyId })
                            await fetchRefresh()
                            return await done({ visible: false })
                        } catch (err) {
                            await done({ loading: false })
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        }
                    })
                }
            })
        }

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
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
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-button type="primary" onClick={fetchDeployChunkCreate}>
                            新增
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="primary"
                            disabled={instState.value.isUpdate || !(state.select[0] as Chunk.ChunkItem)?.allowUpdate}
                            onClick={fetchDeployChunkUpdate}
                        >
                            编辑
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="error"
                            disabled={instState.value.isDelete || !(state.select[0] as Chunk.ChunkItem)?.allowDelete}
                            onClick={fetchDeployChunkDelete}
                        >
                            删除
                        </common-base-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="名称">
                        <form-base-input
                            clearable
                            placeholder="请输入枚举项名称"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-select
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
                        col_status: (data: Chunk.ChunkItem) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>

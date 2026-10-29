<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useColumnService, EventType, pick, stop } from '@/hooks'
import * as feedback from '@/components/srm/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmCommonListSupplier',
    props: {
        /**通讯实例**/
        observer: { type: Object as PropType<EventType>, required: true },
        /**供应商静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**供应商字典枚举**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, router, instOptions, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnUser({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                keyName: 'chat:srm:supplier',
                formState: {
                    /**供应商名称**/
                    name: undefined,
                    /**状态**/
                    status: undefined,
                    /**付款模式**/
                    payMode: undefined,
                    /**供应商来源**/
                    source: undefined
                },
                columns: [
                    { title: '供应商ID', key: 'keyId', width: 100, disabled: true },
                    { title: '供应商名称', key: 'name', minWidth: 240, disabled: true, ellipsis: false },
                    { title: '供应商别名', key: 'alias', width: 140 },
                    { title: '邮箱', key: 'email', width: 200 },
                    { title: '电话号码', key: 'phone', width: 140 },
                    { title: '阶段', key: 'stage', width: 100 },
                    { title: '状态', key: 'status', width: 100 },
                    { title: '付款模式', key: 'payMode', width: 100 },
                    { title: '供应商来源', key: 'source', width: 140 },
                    { title: '归属人', key: 'ownerUserUid', width: 120 },
                    { title: '归属部门', key: 'ownerOrganizations', minWidth: 140 },
                    { title: '等级', key: 'level', width: 100 },
                    { title: '币种', key: 'currency', width: 100 },
                    { title: '余额', key: 'balance', width: 130 },
                    { title: '余额(USD)', key: 'balanceUsd', width: 130 },
                    { title: '信用额度', key: 'credit', width: 120 },
                    { title: '备注', key: 'remark', minWidth: 200, check: false },
                    { title: '创建时间', key: 'createTime', width: 160 }
                ]
            }
        )

        /**跳转客户详情**/
        async function fetchJumpContextSupplier(event: MouseEvent, data: Omix) {
            return await stop(event, async () => {
                return await router.push({
                    path: `/srm/supplier/context/${data.keyId}`,
                    state: { tabTitle: data.name }
                })
            })
        }

        /**新增供应商**/
        async function fetchCreateSupplier() {
            return await feedback.fetchSrmSupplier({
                title: '新增供应商',
                onSubmit: () => fetchRefresh()
            })
        }

        return () => (
            <n-element class="crm-common-list-supplier h-full flex flex-col gap-14 overflow-hidden">
                <common-database-search
                    class="p-0!"
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                    square={['l-t', 'r-t']}
                    ref={formRef}
                    label-width={90}
                    limit={state.limit}
                    v-model:when={state.when}
                    v-model:loading={state.loading}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    v-model:initialize={state.initialize}
                    on-update:database={instOptions.fetchUpdateDatabase}
                    on-restore={instOptions.fetchRestore}
                    on-submit={instOptions.fetchRequest}
                >
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-button class="min-w-80" type="primary" onClick={fetchCreateSupplier}>
                            新增
                        </common-base-button>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="name" label="供应商名称">
                        <form-base-input
                            clearable
                            placeholder="请输入供应商名称/ID"
                            v-model:value={formState.value.name}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            loading={props.chunkState.loading}
                            options={props.chunkOptions.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </common-database-search-column>

                    <common-database-search-column prop="payMode" label="付款模式">
                        <form-base-select
                            clearable
                            placeholder="请选择付款模式"
                            loading={props.chunkState.loading}
                            options={props.chunkOptions.payModeOptions}
                            v-model:value={formState.value.payMode}
                        ></form-base-select>
                    </common-database-search-column>
                    <common-database-search-column prop="source" label="供应商来源">
                        <form-base-cascader
                            show-path
                            clearable
                            filterable
                            check-strategy="child"
                            expand-trigger="click"
                            label-field="label"
                            label-value="value"
                            children-field="children"
                            placeholder="请选择供应商来源"
                            loading={props.chunkState.loading}
                            options={props.chunkState.CHUNK_SRM_USER_SOURCE.options}
                            v-model:value={formState.value.source}
                        ></form-base-cascader>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    class="p-0! overflow-hidden"
                    show-settings
                    //show-command={instState.value.showCommand}
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
                            <common-base-content ellipsis value={data.name}>
                                <n-text class="cursor-pointer" type="info" onClick={(e: MouseEvent) => fetchJumpContextSupplier(e, data)}>
                                    {data.name}
                                </n-text>
                            </common-base-content>
                        ),
                        col_source: (data: Omix) => (
                            <common-base-chunk
                                mode="text"
                                value={data.source}
                                items={props.chunkState.CHUNK_SRM_USER_SOURCE.options}
                            ></common-base-chunk>
                        ),
                        col_balance: (data: Omix) => {
                            return <common-base-number shrink value={data.balance}></common-base-number>
                        },
                        col_balanceUsd: (data: Omix) => {
                            return <common-base-number shrink value={data.balanceUsd}></common-base-number>
                        },
                        col_credit: (data: Omix) => {
                            return <common-base-number shrink value={data.credit}></common-base-number>
                        },
                        col_ownerUserUid: (data: Omix) => {
                            return <common-base-user element="text" data={data.ownerUserUidOptions}></common-base-user>
                        },
                        col_ownerOrganizations: (data: Omix) => {
                            return <common-base-content value={data.ownerUserUidOptions?.organizations}></common-base-content>
                        },
                        col_stage: (data: Omix) => (
                            <common-base-chunk value={data.stage} items={props.chunkOptions.stageOptions}></common-base-chunk>
                        ),
                        col_status: (data: Omix) => (
                            <common-base-chunk value={data.status} items={props.chunkOptions.statusOptions}></common-base-chunk>
                        ),
                        col_payMode: (data: Omix) => (
                            <common-base-chunk value={data.payMode} items={props.chunkOptions.payModeOptions}></common-base-chunk>
                        )
                    }}
                </common-database-table>
            </n-element>
        )
    }
})
</script>

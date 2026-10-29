<script lang="tsx">
import { defineComponent, PropType, Fragment } from 'vue'
import { useColumnService, pick } from '@/hooks'
import { useVModels } from '@vueuse/core'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSupplierContextBasicWrapper',
    emits: ['update:faseNode'],
    props: {
        /**字段描述样式**/
        labelClass: { type: String, default: 'w-84' },
        /**供应商详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**供应商静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**字典枚举**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)
        /**联系人列表**/
        const { state, fetchRefresh, instOptions } = useColumnService(
            (base, payload) => Service.httpBaseSrmColumnUserContact({ ...payload, ...pick(base, ['page', 'size']) }),
            {
                limit: 0,
                immediate: true,
                keyName: 'chat:srm:basic:supplier',
                formState: { userKeyId: faseNode.value.keyId },
                columns: [
                    { title: '序号', key: 'index', width: 90 },
                    { title: '联系人名称', key: 'name', width: 200 },
                    { title: '联系方式', key: 'items', width: 300, ellipsis: false },
                    { title: '地址', key: 'address', minWidth: 300 },
                    { title: '备注', key: 'remark', minWidth: 260, check: false },
                    { title: '状态', key: 'status', width: 120 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        return () => (
            <Fragment>
                <common-base-element is-white is-border wrap="p-inline-14 p-bs-14" class-name="flex flex-col p-14 gap-y-10 overflow-hidden">
                    <common-business-header bar title="基本信息"></common-business-header>
                    <common-base-columns-template class="gap-y-10 gap-x-20" type="auto-fit" number={400}>
                        <common-base-columns-wrapper label-class={props.labelClass} label="供应商名称：">
                            {faseNode.value.name ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="邮箱：">
                            {faseNode.value.email ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="电话号码：">
                            {faseNode.value.phone ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="供应商别名：">
                            {faseNode.value.alias ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="归属人：">
                            <common-base-user element="text" data={faseNode.value.ownerUserUidOptions}></common-base-user>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="归属部门：">
                            <common-base-content value={faseNode.value.ownerUserUidOptions?.organizations}></common-base-content>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="币种：">
                            {faseNode.value.currency ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="余额：">
                            <common-base-number shrink value={faseNode.value.balance}></common-base-number>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="余额(USD)：">
                            <common-base-number shrink value={faseNode.value.balanceUsd}></common-base-number>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="信用额度：">
                            <common-base-number shrink value={faseNode.value.credit}></common-base-number>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="当前等级：">
                            {faseNode.value.level ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="供应商来源：">
                            <common-base-chunk
                                show-path
                                mode="text"
                                value={faseNode.value.source}
                                items={props.chunkState.CHUNK_SRM_USER_SOURCE.options}
                            ></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="当前阶段：">
                            <common-base-chunk value={faseNode.value.stage} items={props.chunkOptions.stageOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="付款模式：">
                            <common-base-chunk value={faseNode.value.payMode} items={props.chunkOptions.payModeOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                    </common-base-columns-template>
                </common-base-element>
                <common-base-element
                    is-white
                    is-border
                    wrap="p-14 flex flex-col flex-1 overflow-hidden"
                    class-name="flex flex-col flex-1 p-14 gap-y-10 overflow-hidden"
                >
                    <common-business-header bar title="联系人信息"></common-business-header>
                    <common-database-table
                        show-index
                        bordered={false}
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
                            col_items: (data: Omix) => (
                                <common-business-contact-chunk
                                    node={data}
                                    items={data.items}
                                    options={props.chunkState.CHUNK_SKYLINE_CONTACT_TYPE.options}
                                ></common-business-contact-chunk>
                            ),
                            col_status: (data: Omix) => (
                                <common-base-chunk value={data.status} items={props.chunkOptions.contactStatusOptions}></common-base-chunk>
                            ),
                            col_createBy: (data: Omix) => {
                                return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                            },
                            col_modifyBy: (data: Omix) => {
                                return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                            }
                        }}
                    </common-database-table>
                </common-base-element>
            </Fragment>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useChunkService, useColumnService } from '@/hooks'
import { useVModels } from '@vueuse/core'
import { Lightning, Chat, UserAvatarFilledAlt } from '@vicons/carbon'
import { fetchCurrent } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumerContextBasicWrapper',
    emits: ['update:faseNode'],
    props: {
        /**字段描述样式**/
        labelClass: { type: String, default: 'w-70' },
        /**客户详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**客户静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**字典枚举**/
        chunkState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**注册来源字典枚举**/
        sourceOptions: { type: Array as PropType<Array<Omix>>, default: () => [] }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)
        /**联系方式类型枚举**/
        // const { chunkState } = useChunkService(e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }), {
        //     types: ['CHUNK_SYSTEM_COMMON_CONTACT_TYPE'],
        //     immediate: true
        // })
        /**联系人列表**/
        const { state, fetchRefresh, instOptions } = useColumnService(
            (base, payload) => Service.httpBaseCrmColumnUserContact({ ...payload, page: base.page, size: base.size }),
            {
                limit: 0,
                immediate: true,
                keyName: 'chat:crm:common:basic:consumer',
                formState: { userKeyId: faseNode.value.keyId },
                transform: (data: Omix) => {
                    return (data.list ?? []).map((item: Omix, index: number) => ({
                        ...item,
                        index: ((data.page ?? 1) - 1) * (data.size ?? 50) + index + 1
                    }))
                },
                columns: [
                    { title: '序号', key: 'index', width: 90, align: 'center' },
                    { title: '联系人名称', key: 'name', width: 160 },
                    { title: '联系方式', key: 'items', width: 260, ellipsis: false },
                    { title: '地址', key: 'address', minWidth: 260, ellipsis: false },
                    { title: '备注', key: 'remark', minWidth: 260, check: false },
                    { title: '状态', key: 'status', width: 100 },
                    { title: '创建人', key: 'createBy', width: 120 },
                    { title: '创建时间', key: 'createTime', width: 160 },
                    { title: '更新人', key: 'modifyBy', width: 120 },
                    { title: '更新时间', key: 'modifyTime', width: 160 }
                ]
            }
        )

        return () => (
            <common-base-scrollbar
                element
                class="crm-consumer-context-basic-wrapper"
                element-props={{ isWhite: true, class: 'flex flex-col flex-1 p-12 gap-y-24 overflow-hidden' }}
            >
                <div class="flex flex-col gap-y-10 overflow-hidden">
                    <common-business-header bar title="基本信息"></common-business-header>
                    <common-base-columns-template is-border class="gap-y-10 gap-x-20 p-10" type="auto-fit" number={400}>
                        <common-base-columns-wrapper label-class={props.labelClass} label="客户名称：">
                            {faseNode.value.name ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="品牌：">
                            <common-base-content value={faseNode.value.brandKeyIdOptions?.name}></common-base-content>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="邮箱：">
                            {faseNode.value.email ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="电话号码：">
                            {faseNode.value.phone ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="客户别名：">
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
                        <common-base-columns-wrapper label-class={props.labelClass} label="信用额度：">
                            {faseNode.value.credit ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="当前等级：">
                            {faseNode.value.level ?? '-'}
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="当前阶段：">
                            <common-base-chunk value={faseNode.value.stage} items={props.chunkOptions.stageOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="客户类型：">
                            <common-base-chunk
                                value={faseNode.value.classType}
                                items={props.chunkOptions.classTypeOptions}
                            ></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="认证状态：">
                            <common-base-chunk
                                value={faseNode.value.authStatus}
                                items={props.chunkOptions.authStatusOptions}
                            ></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="注册来源：">
                            <common-base-chunk value={faseNode.value.source} items={props.sourceOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                        <common-base-columns-wrapper label-class={props.labelClass} label="付款模式：">
                            <common-base-chunk value={faseNode.value.payMode} items={props.chunkOptions.payModeOptions}></common-base-chunk>
                        </common-base-columns-wrapper>
                    </common-base-columns-template>
                </div>
                <div class="flex flex-col flex-1 gap-y-10 overflow-hidden">
                    <common-business-header bar title="联系人信息"></common-business-header>
                    <div class="flex flex-col flex-1 overflow-hidden">
                        <common-database-table
                            pagination-class="p-bs-12!"
                            bordered={false}
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
                                col_items: (data: Omix) => {
                                    return (
                                        <div class="flex flex-col overflow-hidden">
                                            {(data.items ?? []).map((item: Omix, index: number) => (
                                                <div class="flex items-center gap-x-5 overflow-hidden">
                                                    <common-base-chunk
                                                        value={item.type}
                                                        items={props.chunkState.CHUNK_SYSTEM_COMMON_CONTACT_TYPE.options}
                                                    ></common-base-chunk>
                                                    <div class="flex-1 overflow-hidden">{item.value ?? '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                },
                                col_name: (data: Omix) => (
                                    <div class="flex items-center gap-x-10 overflow-hidden">
                                        <common-base-button
                                            class="p-inline-4"
                                            type="tertiary"
                                            secondary
                                            icon-size={24}
                                            icon={UserAvatarFilledAlt}
                                        ></common-base-button>
                                        <span>{data.name ?? '-'}</span>
                                    </div>
                                ),
                                col_status: (data: Omix) => (
                                    <common-base-chunk
                                        value={data.status}
                                        items={props.chunkOptions.contactStatusOptions}
                                    ></common-base-chunk>
                                ),
                                col_createBy: (data: Omix) => {
                                    return <common-base-user element="text" data={data.createByOptions}></common-base-user>
                                },
                                col_modifyBy: (data: Omix) => {
                                    return <common-base-user element="text" data={data.modifyByOptions}></common-base-user>
                                }
                            }}
                        </common-database-table>
                    </div>
                </div>
            </common-base-scrollbar>
        )
    }
})
</script>

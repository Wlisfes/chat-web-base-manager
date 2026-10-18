<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService, fetchCloneByte, v4, pick, omit } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'SrmSupplierFeedback',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**供应商静态枚举、联系方式类型枚举**/
        const { chunkOptions, chunkState, fetchChunkService } = useChunkService(e => Service.httpBaseSrmUserEnums(), {
            request: e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            types: ['CHUNK_SRM_USER_SOURCE', 'CHUNK_SKYLINE_CONTACT_TYPE'],
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**供应商名称**/
                name: props.node.name,
                /**币种**/
                currency: props.node.currency ?? 'USD',
                /**邮箱**/
                email: props.node.email,
                /**电话号码**/
                phone: props.node.phone,
                /**供应商来源**/
                source: props.node.source,
                /**付款模式**/
                payMode: props.node.payMode,
                /**备注**/
                remark: props.node.remark,
                /**联系方式列表：type 为联系方式类型枚举项主键，value 为联系方式内容**/
                items: [{ keyId: v4(), type: 1024188, value: undefined }],
                /**联系人信息：新增供应商时必填**/
                contact: {
                    /**联系人名称**/
                    name: undefined,
                    /**地址**/
                    address: undefined,
                    /**联系人备注**/
                    remark: undefined
                }
            },
            rules: {
                name: { required: true, message: '请输入供应商名称', trigger: 'blur' },
                currency: { required: true, message: '请选择币种', trigger: 'blur' },
                email: { required: true, message: '请输入邮箱', trigger: 'blur' },
                source: { required: true, message: '请选择供应商来源', trigger: 'blur' },
                payMode: { required: true, message: '请选择付款模式', trigger: 'blur' }
            }
        })

        /**详情初始化**/
        async function fetchInitialization() {
            try {
                return await Promise.all([Service.httpBaseSrmUserFaker(), fetchChunkService()]).then(async ([{ data }]) => {
                    const contact = pick(data.contact, ['name', 'address', 'remark'])
                    const items = (data.contact.items ?? [{}]).map((item: Omix) => ({ ...item, disabled: true, keyId: v4() }))
                    return await setForm({ ...data, items, contact }).then(async () => {
                        return await setState({ initialize: false })
                    })
                })
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    const formOptions = fetchCloneByte(omit(formState.value, ['items']), {
                        contact: fetchCloneByte(formState.value.contact, {
                            items: formState.value.items.map(e => pick(e, ['type', 'value']))
                        })
                    })

                    await Service.httpBaseSrmCreateUser(formOptions)

                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: '操作成功' })
                    })
                } catch (err) {
                    return await setState({ loading: false, disabled: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={960}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                    require-mark-placement="left"
                    base-columns-template
                    base-columns-template-props={{ class: 'gap-x-20', type: 'auto-fit', number: 260 }}
                >
                    <form-base-column label="供应商名称" path="name">
                        <form-base-input
                            maxlength={64}
                            placeholder="请输入供应商名称"
                            v-model:value={formState.value.name}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="币种" path="currency">
                        <form-base-input
                            disabled
                            maxlength={64}
                            placeholder="请选择币种"
                            v-model:value={formState.value.currency}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="邮箱" path="email">
                        <form-base-input maxlength={128} placeholder="请输入邮箱" v-model:value={formState.value.email}></form-base-input>
                    </form-base-column>
                    <form-base-column label="付款模式" path="payMode">
                        <form-base-select
                            placeholder="请选择付款模式"
                            options={chunkOptions.value.payModeOptions}
                            v-model:value={formState.value.payMode}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="电话号码" path="phone">
                        <form-base-input
                            maxlength={32}
                            placeholder="请输入电话号码"
                            v-model:value={formState.value.phone}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="供应商来源" path="source">
                        <form-base-cascader
                            show-path
                            filterable
                            check-strategy="child"
                            expand-trigger="click"
                            label-field="label"
                            label-value="value"
                            children-field="children"
                            placeholder="请选择供应商来源"
                            options={chunkState.CHUNK_SRM_USER_SOURCE.options}
                            v-model:value={formState.value.source}
                        ></form-base-cascader>
                    </form-base-column>
                    <form-base-column full label="备注" path="remark">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                            autosize={{ minRows: 2, maxRows: 6 }}
                        />
                    </form-base-column>
                    <form-base-column label="联系人名称" path="contact.name">
                        <form-base-input
                            maxlength={64}
                            placeholder="请输入联系人名称"
                            v-model:value={formState.value.contact.name}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column span={2} label="联系人地址" path="contact.address">
                        <form-base-input
                            maxlength={512}
                            placeholder="请输入联系人地址"
                            v-model:value={formState.value.contact.address}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column full required show-feedback={false} label="联系方式">
                        <div class="flex flex-col flex-1">
                            {formState.value.items.map((item, index) => (
                                <common-business-contact-block
                                    key={item.keyId}
                                    index={index}
                                    options={chunkState.CHUNK_SKYLINE_CONTACT_TYPE.options}
                                    v-model:list={formState.value.items}
                                    v-model:node={item}
                                ></common-business-contact-block>
                            ))}
                        </div>
                    </form-base-column>
                    <form-base-column full label="联系人备注">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            placeholder="请输入联系人备注"
                            v-model:value={formState.value.contact.remark}
                            autosize={{ minRows: 2, maxRows: 4 }}
                        />
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent, Fragment, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { faker, v4 } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmCommonUserFeedback',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**品牌下拉列表**/
        const brandOptions = useSelectService(e => Service.httpBaseFinanceSelectBrand(), {
            immediate: false
        })
        /**币种下拉列表**/
        const currencyOptions = useSelectService(e => Service.httpBaseFinanceSelectCurrency(), {
            immediate: false
        })
        /**客户静态枚举**/
        const { chunkOptions, chunkState, fetchChunkService } = useChunkService(e => Service.httpBaseCrmUserEnums(), {
            immediate: false
        })
        /**联系方式类型枚举**/
        const { chunkState: contactChunkState, fetchCommonService: fetchContactChunkService } = useChunkService(
            e => Service.httpBaseSkylineChunkOptionColumn({ types: e.types }),
            { immediate: false, types: ['CHUNK_SYSTEM_COMMON_CONTACT_TYPE'] }
        )
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseCrmConsumerResolver,
            formState: {
                /**客户名称**/
                name: props.node.name,
                /**归属品牌**/
                brandKeyId: props.node.brandKeyId,
                /**币种**/
                currency: props.node.currency,
                /**邮箱**/
                email: props.node.email,
                /**电话号码**/
                phone: props.node.phone,
                /**付款模式**/
                payMode: props.node.payMode,
                /**备注**/
                remark: props.node.remark,
                /**联系人信息：新增客户时必填**/
                contact: {
                    /**联系人名称**/
                    name: undefined,
                    /**地址**/
                    address: undefined,
                    /**联系方式列表：type 为联系方式类型枚举项主键，value 为联系方式内容**/
                    items: [{ keyId: v4(), type: undefined, value: undefined }],
                    /**联系人备注**/
                    remark: undefined
                }
            },
            rules: {
                name: { required: true, message: '请输入客户名称', trigger: 'blur' },
                brandKeyId: { required: true, type: 'number', message: '请选择归属品牌', trigger: 'blur' },
                currency: { required: true, message: '请选择币种', trigger: 'blur' },
                email: { required: true, message: '请输入邮箱', trigger: 'blur' },
                payMode: { required: true, message: '请选择付款模式', trigger: 'blur' },
                contact: {
                    name: { required: true, message: '请输入联系人名称', trigger: 'blur' },
                    items: {
                        trigger: 'blur',
                        validator: (_rule: unknown, items: Array<Omix>) => {
                            return (items ?? []).every(item => item.type && item.value?.trim()) || new Error('请完善联系方式类型和内容')
                        }
                    }
                }
            }
        })

        /**详情初始化**/
        async function fetchBaseCrmConsumerResolver() {
            return await Promise.all([
                brandOptions.fetchRequest(),
                currencyOptions.fetchRequest(),
                fetchChunkService(),
                fetchContactChunkService()
            ]).then(async () => {
                try {
                    if (['CREATE'].includes(props.command)) {
                        const formOptions: Omix = {
                            currency: 'USD',
                            payMode: 'prepaid',
                            email: faker.internet.email({
                                provider: faker.helpers.arrayElement(['sugtbt.com', 'qabq.com', 'nqmo.com', 'uuf.me'])
                            }),
                            name: faker.company.name(),
                            phone: faker.helpers.fromRegExp('1[3-9][0-9]{9}'),
                            remark: faker.lorem.paragraph(),
                            contact: {
                                name: faker.person.fullName(),
                                address: faker.location.streetAddress(true),
                                items: [],
                                remark: undefined
                            }
                        }
                        return await setForm(formOptions).then(async () => {
                            return await setState({ initialize: false })
                        })
                    }
                    return await setForm(fetchReste(props.node)).then(async () => {
                        return await setState({ initialize: false })
                    })
                } catch (err) {
                    return await setState({ initialize: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseCrmCreateUser(formState.value)
                    }
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
                    <form-base-column label="客户名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入客户名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="归属品牌" path="brandKeyId">
                        <form-base-select
                            filterable
                            placeholder="请选择归属品牌"
                            label-field="name"
                            label-value="keyId"
                            options={brandOptions.dataSource.value}
                            v-model:value={formState.value.brandKeyId}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="币种" path="currency">
                        <form-base-select
                            filterable
                            placeholder="请选择币种"
                            label-value="currency"
                            label-field="currency"
                            options={currencyOptions.dataSource.value}
                            v-model:value={formState.value.currency}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="邮箱" path="email">
                        <form-base-input maxlength={128} placeholder="请输入邮箱" v-model:value={formState.value.email}></form-base-input>
                    </form-base-column>
                    <form-base-column label="付款模式" path="payMode">
                        <form-base-select
                            placeholder="请选择付款模式"
                            loading={chunkState.loading}
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
                    <form-base-column full label="备注" path="remark">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                            autosize={{ minRows: 2, maxRows: 6 }}
                        />
                    </form-base-column>
                    {['CREATE'].includes(props.command) && (
                        <Fragment>
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
                            <form-base-column full label="联系方式" path="contact.items">
                                <n-dynamic-input
                                    v-model:value={formState.value.contact.items}
                                    max={50}
                                    onCreate={() => ({ type: null, value: '' })}
                                >
                                    {{
                                        default: ({ value }: { value: Omix }) => (
                                            <div class="flex flex-1 gap-x-10">
                                                <form-base-select
                                                    class="w-160"
                                                    placeholder="类型"
                                                    label-field="label"
                                                    label-value="keyId"
                                                    loading={contactChunkState.loading}
                                                    options={contactChunkState.CHUNK_SYSTEM_COMMON_CONTACT_TYPE.options}
                                                    v-model:value={value.type}
                                                ></form-base-select>
                                                <form-base-input
                                                    class="flex-1"
                                                    maxlength={128}
                                                    placeholder="请输入联系方式"
                                                    v-model:value={value.value}
                                                ></form-base-input>
                                            </div>
                                        )
                                    }}
                                </n-dynamic-input>
                            </form-base-column>
                            <form-base-column full label="联系人备注" path="contact.remark">
                                <n-input
                                    type="textarea"
                                    maxlength={1024}
                                    placeholder="请输入联系人备注"
                                    v-model:value={formState.value.contact.remark}
                                    autosize={{ minRows: 2, maxRows: 4 }}
                                />
                            </form-base-column>
                        </Fragment>
                    )}
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>

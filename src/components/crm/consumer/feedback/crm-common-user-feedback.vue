<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { faker } from '@/utils'
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
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseCrmConsumerResolver,
            formState: {
                name: props.node.name,
                brandKeyId: props.node.brandKeyId,
                currency: props.node.currency,
                email: props.node.email,
                phone: props.node.phone,
                payMode: props.node.payMode,
                remark: props.node.remark
            },
            rules: {
                name: { required: true, message: '请输入客户名称', trigger: 'blur' },
                brandKeyId: { required: true, type: 'number', message: '请选择归属品牌', trigger: 'blur' },
                currency: { required: true, message: '请选择币种', trigger: 'blur' },
                email: { required: true, message: '请输入邮箱', trigger: 'blur' },
                payMode: { required: true, message: '请选择付款模式', trigger: 'blur' }
            }
        })

        /**详情初始化**/
        async function fetchBaseCrmConsumerResolver() {
            return await Promise.all([brandOptions.fetchRequest(), currencyOptions.fetchRequest(), fetchChunkService()]).then(async () => {
                try {
                    if (['CREATE'].includes(props.command)) {
                        const formOptions = {
                            currency: 'USD',
                            payMode: 'prepaid',
                            email: faker.internet.email({
                                provider: faker.helpers.arrayElement(['sugtbt.com', 'qabq.com', 'nqmo.com', 'uuf.me'])
                            }),
                            name: faker.company.name(),
                            phone: faker.helpers.fromRegExp('1[3-9][0-9]{9}'),
                            remark: faker.lorem.paragraph()
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
                width={750}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    class="grid-auto-320 gap-x-20"
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
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
                    <form-base-column class="grid-col-span-2" label="备注" path="remark">
                        <n-input
                            type="textarea"
                            maxlength={1024}
                            show-count
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                            autosize={{ minRows: 3, maxRows: 6 }}
                        />
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>

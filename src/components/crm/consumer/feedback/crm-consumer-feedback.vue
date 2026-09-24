<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { faker } from '@/utils'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmConsumerFeedback',
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
        const brandOptions = useSelectService(e => Service.httpBaseFinanceSelectBrand())
        /**币种下拉列表**/
        const currencyOptions = useSelectService(e => Service.httpBaseFinanceSelectCurrency())
        /**表单实例**/
        const { formState, formRef, state, chunkState, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseCrmConsumerResolver,
            // 本地静态枚举已废弃，待切换为后端枚举接口
            // chunkNames: { CHUNK_CONSUMER_PAY_MODE: true },
            formState: {
                name: props.node.name,
                brandId: props.node.brandId,
                currency: props.node.currency,
                email: props.node.email,
                phone: props.node.phone,
                payMode: props.node.payMode,
                remark: props.node.remark
            },
            rules: {
                name: { required: true, message: '请输入客户名称', trigger: 'blur' },
                brandId: { required: true, type: 'number', message: '请选择归属品牌', trigger: 'change' },
                currency: { required: true, message: '请选择币种', trigger: 'change' },
                email: { required: true, message: '请输入邮箱', trigger: 'blur' },
                payMode: { required: true, message: '请选择付款模式', trigger: 'change' }
            }
        })

        /**详情初始化**/
        async function fetchBaseCrmConsumerResolver() {
            return await Promise.all([brandOptions.fetchRequest(), currencyOptions.fetchRequest()]).then(async () => {
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
                        await Service.httpBaseAccountCreateConsumer(formState.value)
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
                        <form-base-input
                            maxlength={64}
                            placeholder="请输入客户名称"
                            v-model:value={formState.value.name}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="归属品牌" path="brandId">
                        <form-base-select
                            filterable
                            placeholder="请选择归属品牌"
                            value-field="keyId"
                            options={brandOptions.dataSource.value}
                            v-model:value={formState.value.brandId}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="币种" path="currency">
                        <form-base-select
                            filterable
                            placeholder="请选择币种"
                            value-field="currency"
                            label-field="currency"
                            options={currencyOptions.dataSource.value}
                            v-model:value={formState.value.currency}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="邮箱" path="email">
                        <form-base-input
                            maxlength={128}
                            placeholder="请输入邮箱"
                            v-model:value={formState.value.email}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="付款模式" path="payMode">
                        <form-base-select
                            placeholder="请选择付款模式"
                            // 本地静态枚举已废弃，待切换为后端枚举接口: options={chunkState.CHUNK_CONSUMER_PAY_MODE}
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

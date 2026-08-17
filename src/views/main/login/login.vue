<script lang="tsx">
import { defineComponent } from 'vue'
import { useFormService, useCodeService } from '@/hooks'
import { stop, fetchCompose } from '@/utils'
import { useGlobal, useStore } from '@/store'
import { fetchNotifyService } from '@/plugins'

export default defineComponent({
    name: 'BaseAuthorize',
    setup(props) {
        const { fetchAuthAccountToken } = useStore(useGlobal)
        const { link, loading, fetchRefresh, fetchComplete } = useCodeService()
        const { router, formRef, formState, state, setState, fetchValidater } = useFormService({
            formState: {
                number: '',
                password: '',
                code: ''
            },
            rules: {
                number: { required: true, trigger: 'blur', message: '请输入登录账号' },
                password: { required: true, trigger: 'blur', min: 6, max: 18, message: '请输入6~18位登录密码' },
                code: { required: true, trigger: 'blur', message: '请输入验证码' }
            }
        })

        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    return await fetchAuthAccountToken(formState.value).then(async ({ data }) => {
                        return await fetchCompose(data).then(async () => {
                            return router.push({ path: '/', replace: true })
                        })
                    })
                } catch (err) {
                    return await await setState({ loading: false, disabled: false }).then(async () => {
                        return await Promise.all([fetchRefresh(), fetchNotifyService({ type: 'error', title: err.message })])
                    })
                }
            })
        }

        return () => (
            <n-element class="login-element h-full p-24 flex justify-center items-center">
                <layout-common-stripe></layout-common-stripe>
                <n-card
                    class="w-full h-full max-w-520 max-h-520 p-24"
                    content-class="p-0 flex flex-col justify-center"
                    style={{ boxShadow: 'var(--box-shadow-1)' }}
                >
                    <form-common-container
                        class="w-full max-w-375 m-auto select-none"
                        size="large"
                        ref={formRef}
                        model={formState.value}
                        rules={state.rules}
                        disabled={state.loading}
                        show-label={false}
                    >
                        <n-h2 class="text-28 font-500 text-center">
                            <n-text depth={2}>欢迎登录</n-text>
                        </n-h2>
                        <n-form-item path="number">
                            <form-common-column-input
                                maxlength={32}
                                type="text"
                                placeholder="请输入登录账号"
                                v-model:value={formState.value.number}
                                input-props={{ autocomplete: 'on' }}
                                onSubmit={fetchSubmit}
                                prefix={<common-element-icon size={22} name="nest-unset-user"></common-element-icon>}
                            ></form-common-column-input>
                        </n-form-item>
                        <n-form-item path="password">
                            <form-common-column-input
                                maxlength={32}
                                placeholder="请输入登录密码"
                                type="password"
                                show-password-on="click"
                                input-props={{ autocomplete: 'password' }}
                                style={{ '--input-password-right': '46px' }}
                                v-model:value={formState.value.password}
                                onSubmit={fetchSubmit}
                                prefix={<common-element-icon size={22} name="nest-unset-ockes"></common-element-icon>}
                            ></form-common-column-input>
                        </n-form-item>
                        <n-form-item path="code">
                            <n-flex class="w-full">
                                <form-common-column-input
                                    class="flex-1"
                                    type="text"
                                    placeholder="验证码"
                                    maxlength={4}
                                    v-model:value={formState.value.code}
                                    onSubmit={fetchSubmit}
                                    prefix={<common-element-icon size={22} name="nest-unset-codex"></common-element-icon>}
                                ></form-common-column-input>
                                <common-element-codex
                                    link={link.value}
                                    loading={loading.value}
                                    disabled={state.loading}
                                    onClick={fetchRefresh}
                                    onComplete={fetchComplete}
                                ></common-element-codex>
                            </n-flex>
                        </n-form-item>
                        <n-form-item>
                            <common-element-button
                                class="w-full"
                                type="info"
                                disabled={state.loading}
                                loading={state.loading}
                                onClick={fetchSubmit}
                            >
                                立即登录
                            </common-element-button>
                        </n-form-item>
                        <n-flex size={32} wrap-item={false} justify="center" align="center" style={{ marginTop: '24px' }}>
                            <common-element-button text>
                                <common-element-icon size={44} name="nest-github"></common-element-icon>
                            </common-element-button>
                            <common-element-button text>
                                <common-element-icon size={24} name="nest-specor"></common-element-icon>
                            </common-element-button>
                            <common-element-button text>
                                <common-element-icon size={44} name="nest-google"></common-element-icon>
                            </common-element-button>
                        </n-flex>
                    </form-common-container>
                </n-card>
            </n-element>
        )
    }
})
</script>

<style lang="scss" scoped>
.login-element {
    overflow: hidden;
    box-sizing: border-box;
    transition:
        padding 0.3s var(--cubic-bezier-ease-in-out),
        background-color 0.3s var(--cubic-bezier-ease-in-out);
    background-image: url('@/assets/images/nest-element-login.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    :deep(.n-input) {
        --n-padding-left: 0;
        --n-padding-right: 0;
        --input-password-right: 14px;
        .n-input__prefix {
            position: absolute;
            z-index: 1;
            height: 100%;
            margin: 0;
            left: 14px;
        }
        .n-input__suffix {
            position: absolute;
            z-index: 1;
            height: 100%;
            margin: 0;
            right: 14px;
        }
        .n-input__placeholder,
        .n-input__input-el {
            padding-right: var(--input-password-right);
            padding-left: 46px;
        }
    }
}
</style>

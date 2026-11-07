import { isEmail, isEmpty } from 'class-validator'

/**客户、供应商邮箱失焦异步校验：已注册为客户的邮箱不能再注册供应商，反之亦然。*/
export function fetchAccountEmailRule(
    request: (params: Omix) => Promise<{ data: { available: boolean; message?: string } }>,
    keyId?: number
) {
    return {
        required: true,
        trigger: 'blur',
        async validator(_rule: unknown, value: string) {
            const email = value?.trim()
            if (isEmpty(email)) {
                throw new Error('请输入邮箱')
            }
            if (!isEmail(email)) {
                throw new Error('邮箱格式错误')
            }
            try {
                const { data } = await request(keyId ? { email, keyId } : { email })
                if (!data?.available) {
                    throw new Error(data?.message || '邮箱已被使用')
                }
            } catch (error) {
                if (error instanceof Error && error.message && !error.message.startsWith('Cannot ')) {
                    throw error
                }
                const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : ''
                throw new Error(message && !message.startsWith('Cannot ') ? message : '邮箱校验暂时不可用，请稍后重试')
            }
        }
    }
}

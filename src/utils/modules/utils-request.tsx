import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { APP_COOKIE, getToken, getCookie, fetchDestroy, fetchCompose } from '@/utils'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

/**开发环境使用 Vite 同源代理，生产环境访问独立 API 域名。*/
export const API_BASE_URL = configuredApiBaseUrl || (import.meta.env.DEV ? '' : 'https://chat-web.lisfes.cn')

export const request: AxiosRequest = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000,
    withCredentials: true
})

/**拼接请求接口地址，格式与服务端错误响应的url字段一致：METHOD /api/...**/
function fetchRequestUrl(config?: InternalAxiosRequestConfig) {
    const method = (config?.method ?? 'get').toUpperCase()
    return `${method} ${config?.url ?? ''}`
}

/**自定义错误处理**/
async function fetchInizeNotice(response: AxiosResponse) {
    const data = response.data
    const isLoginRequest = response.config.url?.includes('/api/auth/token/login')
    if (data.code === 401 && !isLoginRequest) {
        await fetchDestroy()
        window.location.replace('/login')
    }
    if (data.code !== 200) {
        /**旧版本服务未返回url时使用请求配置兜底，便于直接定位报错接口**/
        return Promise.reject({ ...data, url: data.url || fetchRequestUrl(response.config) })
    }
    return Promise.resolve(data)
}

/**token续时状态**/
let isRefreshing = false
let refreshQueue: Array<{
    resolve: (token: string) => void
    reject: (error: unknown) => void
}> = []

/**检查token是否需要续时**/
function fetchAuthAccountTokenContinue(): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const token = getToken()
            const expires = getCookie<number>(APP_COOKIE.APP_TOKEN_EXPIRES, 0)
            const nowtime = getCookie<number>(APP_COOKIE.APP_TOKEN_CREATED_EXPIRES, 0)
            const elapsed = (Date.now() - nowtime) / 1000
            if (expires * 0.3 > elapsed) {
                /**token有效期剩余时间大于70%、直接使用当前token**/
                return resolve(token)
            } else if (!isRefreshing) {
                /**需要续时且当前无续时任务**/
                isRefreshing = true
                try {
                    const { data } = await axios.post(`${API_BASE_URL}/api/auth/token/continue`, null, {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    if (data.code === 200) {
                        await fetchCompose(data.data)
                        /**执行队列中等待的请求**/
                        refreshQueue.forEach(waiter => waiter.resolve(data.data.accessToken))
                        refreshQueue = []
                        return resolve(data.data.accessToken)
                    } else {
                        throw data
                    }
                } catch (err) {
                    refreshQueue.forEach(waiter => waiter.reject(err))
                    refreshQueue = []
                    await fetchDestroy()
                    window.location.replace('/login')
                    return reject(err)
                } finally {
                    isRefreshing = false
                }
            } else {
                /**续时进行中、当前请求排队等待新token**/
                return resolve(
                    await new Promise<string>((queueResolve, queueReject) => {
                        refreshQueue.push({ resolve: queueResolve, reject: queueReject })
                    })
                )
            }
        } catch (err) {
            return reject(err)
        }
    })
}

request.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${await fetchAuthAccountTokenContinue()}`
        }
        return config
    },
    (error: any) => Promise.reject(error)
)

request.interceptors.response.use(
    (response: AxiosResponse) => fetchInizeNotice(response),
    (error: any) => {
        if (error.response) {
            return fetchInizeNotice(error.response)
        }
        return Promise.reject({
            message: error.message || '网络连接异常',
            code: 500,
            url: fetchRequestUrl(error.config)
        })
    }
)

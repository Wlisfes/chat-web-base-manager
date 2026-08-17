import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { APP_COOKIE, getToken, getCookie, fetchDestroy, fetchCompose } from '@/utils'

export const request: AxiosRequest = axios.create({
    timeout: 120000,
    headers: {
        platform: 'manager'
    }
})

/**自定义错误处理**/
async function fetchInizeNotice(response: AxiosResponse) {
    const data = response.data
    if (data.code === 401) {
        await fetchDestroy()
        window.location.replace('/login')
    }
    if (data.code !== 200) {
        return Promise.reject(data)
    }
    return Promise.resolve(data)
}

/**token续时状态**/
let isRefreshing = false
let refreshQueue: Array<any> = []

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
                    const { data } = await axios.post('/api/windows/auth/token/continue', null, {
                        headers: { Authorization: token, platform: 'manager' }
                    })
                    if (data.code === 200) {
                        await fetchCompose(data.data)
                        /**执行队列中等待的请求**/
                        refreshQueue.forEach(cb => cb(data.data.token))
                        refreshQueue = []
                        return resolve(data.data.token)
                    } else {
                        throw data
                    }
                } catch (err) {
                    await fetchDestroy()
                    window.location.replace('/login')
                    return reject(err)
                } finally {
                    isRefreshing = false
                }
            } else {
                /**续时进行中、当前请求排队等待新token**/
                return resolve(
                    await new Promise<string>(queueResolve => {
                        refreshQueue.push((newToken: string) => queueResolve(newToken))
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
            config.headers.Authorization = await fetchAuthAccountTokenContinue()
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
        return Promise.reject({ message: error.message || '网络连接异常', code: 500 })
    }
)

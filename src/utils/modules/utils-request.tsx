import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  APP_COOKIE,
  getToken,
  getCookie,
  fetchDestroy,
  fetchCompose,
} from "@/utils";

const API_BASE_URL = import.meta.env.PROD ? "https://chat-web.lisfes.cn" : "";

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export const request: AxiosRequest = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  withCredentials: true,
  headers: {
    platform: "manager",
  },
});

/**自定义错误处理**/
async function fetchInizeNotice(response: AxiosResponse) {
  const data = response.data;
  const isLoginRequest = response.config.url?.includes(
    "/api/account/auth/token/login",
  );
  if (data.code === 401 && !isLoginRequest) {
    await fetchDestroy();
    window.location.replace("/login");
  }
  if (data.code !== 200) {
    return Promise.reject(data);
  }
  return Promise.resolve(data);
}

/**token续时状态**/
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**检查token是否需要续时**/
function fetchAuthAccountTokenContinue(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const token = getToken();
      const expires = getCookie<number>(APP_COOKIE.APP_TOKEN_EXPIRES, 0);
      const nowtime = getCookie<number>(
        APP_COOKIE.APP_TOKEN_CREATED_EXPIRES,
        0,
      );
      const elapsed = (Date.now() - nowtime) / 1000;
      if (expires * 0.3 > elapsed) {
        /**token有效期剩余时间大于70%、直接使用当前token**/
        return resolve(token);
      } else if (!isRefreshing) {
        /**需要续时且当前无续时任务**/
        isRefreshing = true;
        try {
          const { data } = await axios.post(
            apiUrl("/api/account/auth/token/continue"),
            null,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
                platform: "manager",
              },
            },
          );
          if (data.code === 200) {
            await fetchCompose(data.data);
            /**执行队列中等待的请求**/
            refreshQueue.forEach((waiter) =>
              waiter.resolve(data.data.accessToken),
            );
            refreshQueue = [];
            return resolve(data.data.accessToken);
          } else {
            throw data;
          }
        } catch (err) {
          refreshQueue.forEach((waiter) => waiter.reject(err));
          refreshQueue = [];
          await fetchDestroy();
          window.location.replace("/login");
          return reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        /**续时进行中、当前请求排队等待新token**/
        return resolve(
          await new Promise<string>((queueResolve, queueReject) => {
            refreshQueue.push({ resolve: queueResolve, reject: queueReject });
          }),
        );
      }
    } catch (err) {
      return reject(err);
    }
  });
}

request.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${await fetchAuthAccountTokenContinue()}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

request.interceptors.response.use(
  (response: AxiosResponse) => fetchInizeNotice(response),
  (error: any) => {
    if (error.response) {
      return fetchInizeNotice(error.response);
    }
    return Promise.reject({
      message: error.message || "网络连接异常",
      code: 500,
    });
  },
);

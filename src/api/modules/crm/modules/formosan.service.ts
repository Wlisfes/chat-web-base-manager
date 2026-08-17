import { request } from '@/utils'

/**销售管理-短信报价-初始化报价草稿**/
export function httpSmsFormosanDraftInit(data: Omix) {
    return request({
        url: `/api/windows/crm/formosan/sms/draft/init`,
        method: 'POST',
        data
    })
}

/**销售管理-短信报价-报价草稿列表**/
export function httpSmsFormosanDraftColumn(data: Omix) {
    return request({
        url: `/api/windows/crm/formosan/sms/draft/column`,
        method: 'POST',
        data
    })
}

/**销售管理-短信报价-修改报价草稿**/
export function httpSmsFormosanDraftUpdate(data: Omix) {
    return request({
        url: `/api/windows/crm/formosan/sms/draft/update`,
        method: 'POST',
        data
    })
}

/**销售管理-短信报价-删除报价草稿**/
export function httpSmsFormosanDraftDelete(data: Omix) {
    return request({
        url: `/api/windows/crm/formosan/sms/draft/delete`,
        method: 'POST',
        data
    })
}

/**销售管理-短信报价-预览报价**/
export function httpSmsFormosanPreview(data: Omix) {
    return request({
        url: `/api/windows/crm/formosan/sms/preview`,
        method: 'POST',
        data
    })
}

/**销售管理-短信报价-发布报价**/
export function httpSmsFormosanPublish(data: Omix) {
    return request({
        url: `/api/windows/crm/formosan/sms/publish`,
        method: 'POST',
        data
    })
}

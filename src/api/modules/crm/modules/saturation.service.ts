import { request } from '@/utils'

/**销售管理-报价查询-分页列表**/
export function httpSmsSaturationColumn(data: Omix) {
    return request({
        url: `/api/windows/crm/saturation/sms/column`,
        method: 'POST',
        data
    })
}

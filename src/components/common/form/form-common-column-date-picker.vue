<script lang="tsx">
import { defineComponent, computed, nextTick, PropType } from 'vue'
import { moment, isNotEmpty } from '@/utils'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'FormCommonColumnDatePicker',
    emits: ['update:startTime', 'update:endTime', 'update:value', '-change:value'],
    props: {
        /**Date Picker 的类型**/
        type: { type: String as PropType<string | 'daterange' | 'datetimerange'>, default: 'daterange' },
        /**开始时间**/
        startTime: { type: [String, Number] },
        /**结束时间**/
        endTime: { type: [String, Number] }
    },
    setup(props, { emit }) {
        const { startTime, endTime } = useVModels(props, emit)

        /**时间组合模式**/
        const rangeTime = computed(() => {
            if (isNotEmpty(startTime.value) && isNotEmpty(endTime.value)) {
                return [moment(startTime.value).valueOf(), moment(endTime.value).valueOf()]
            }
            return null
        })

        /**时间组合模式变更**/
        async function fetchRangeUpdate(e: any, [a, b]: Array<string>) {
            if (isNotEmpty(a) && isNotEmpty(b)) {
                startTime.value = a
                endTime.value = b
            } else {
                startTime.value = null as never
                endTime.value = null as never
            }
            return await nextTick().then(() => {
                return emit('-change:value', { startTime: startTime.value, endTime: endTime.value })
            })
        }

        return () => {
            if (isNotEmpty(props.type) && props.type.includes('range')) {
                return (
                    <n-date-picker
                        class="form-common-column-date-picker w-full"
                        type={props.type}
                        value={rangeTime.value}
                        on-update:value={fetchRangeUpdate}
                    />
                )
            }
            return <n-date-picker class="form-common-column-date-picker w-full" type={props.type} />
        }
    }
})
</script>

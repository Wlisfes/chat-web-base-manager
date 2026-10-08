<script lang="tsx">
import { defineComponent, computed, PropType } from 'vue'

export default defineComponent({
    name: 'CommonBaseNumber',
    props: {
        /**传入金额**/
        value: { type: [String, Number] as PropType<string | number>, default: 0 },
        /**小数精度**/
        precision: { type: Number as PropType<number>, default: 6 }
    },
    setup(props) {
        /**单位倍率**/
        const bit = Number(`1${Array.from({ length: props.precision }).fill('0').join('')}`)
        /**数字计算**/
        const num = computed(() => Math.trunc(Number(props.value) * bit) / bit)
        /**小数分割**/
        const node = computed(() => {
            const [integer, decimal] = String(num.value).split('.')
            return { integer, decimal: (decimal ?? '').padEnd(props.precision, '0') }
        })

        return () => (
            <div class="common-base-number flex-inline items-end">
                <n-text depth={1}>{node.value.integer}</n-text>
                <n-text class="text-14" depth={3}>
                    {`.${node.value.decimal}`}
                </n-text>
            </div>
        )
    }
})
</script>

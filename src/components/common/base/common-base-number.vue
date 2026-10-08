<script lang="tsx">
import { defineComponent, computed, PropType } from 'vue'

export default defineComponent({
    name: 'CommonBaseNumber',
    props: {
        /**传入金额**/
        value: { type: [String, Number] as PropType<string | number>, default: 0 },
        /**小数精度**/
        precision: { type: Number as PropType<number>, default: 6 },
        /**是否反转，默认是正向转换**/
        reverse: { type: Boolean, default: false }
    },
    setup(props) {
        const bit = Number(`1${Array.from({ length: props.precision }).fill('0').join('')}`)

        const value = computed(() => {})

        const formatValue = (value: string | number) => {
            if (props.reverse) {
                return (Number(value) * 1_000_000).toFixed(props.precision)
            } else {
                return (Number(value) / 1_000_000).toFixed(props.precision)
            }
        }

        return () => <span>{(Number(props.value) / 1_000_000).toFixed(props.precision)}</span>
    }
})
</script>

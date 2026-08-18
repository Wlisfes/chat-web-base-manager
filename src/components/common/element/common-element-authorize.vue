<script lang="tsx">
import { defineComponent, PropType, Fragment } from 'vue'
import { useGlobal, useStore } from '@/store'

export default defineComponent({
    name: 'CommonElementAuthorize',
    props: {
        /**权限标识**/
        value: { type: [String, Array] as PropType<string | Array<string>> }
    },
    setup(props, { slots }) {
        const { sheetOptions, superAdmin } = useStore(useGlobal)
        return () => {
            const required = Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
            const allowed = superAdmin.value || required.length === 0 || required.every(code => sheetOptions.value.includes(code))
            return allowed ? <Fragment>{slots.default && slots.default()}</Fragment> : null
        }
    }
})
</script>

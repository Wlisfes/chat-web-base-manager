<script lang="tsx">
import { defineComponent, PropType, Fragment } from 'vue'

export default defineComponent({
    name: 'CommonElementAuthorize',
    props: {
        /**权限标识**/
        value: { type: [String, Array] as PropType<string | Array<string>> }
    },
    setup(props, { slots }) {
        return () => {
            return <Fragment>{slots.default && slots.default()}</Fragment>
        }
    }
})
</script>

<script lang="tsx">
import { defineComponent, PropType, Fragment, VNode } from 'vue'
import { useGlobal, useStore } from '@/store'

export default defineComponent({
    name: 'CommonBaseAuthorize',
    props: {
        /**空节点内容**/
        empty: { type: [Number, String, Object] as PropType<string | number | VNode> },
        /**是否开启根节点**/
        element: { type: Boolean, default: false },
        /**权限标识**/
        keyName: { type: [String, Array] as PropType<string | Array<string>> }
    },
    setup(props, { slots }) {
        const { sheetOptions, superAdmin } = useStore(useGlobal)
        return () => {
            const required = [props.keyName ?? []].flat()
            const allowed = superAdmin.value || required.length === 0 || required.every(code => sheetOptions.value.includes(code))

            if (allowed && props.element) {
                return <div class="common-base-authorize">{slots.default && slots.default()}</div>
            } else if (allowed) {
                return <Fragment>{slots.default && slots.default()}</Fragment>
            }
            return props.empty
        }
    }
})
</script>

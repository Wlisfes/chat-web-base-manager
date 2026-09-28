<script lang="tsx">
import { defineComponent, PropType, Fragment, VNode } from 'vue'
import { useGlobal, useStore } from '@/store'

export default defineComponent({
    name: 'CommonBaseAuthorize',
    inheritAttrs: false,
    props: {
        /**根节点样式**/
        className: { type: String, default: '' },
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
            const keys = [props.keyName ?? []].flat()
            // 未配置权限码视为无权限，只有超级管理员放行，避免漏写 key-name 时按钮对所有人可见。
            const allowed = superAdmin.value || (keys.length > 0 && keys.every(code => sheetOptions.value.includes(code)))
            if (allowed && props.element) {
                return <div class={`common-base-authorize ${props.className}`}>{slots.default && slots.default()}</div>
            } else if (allowed) {
                return <Fragment>{slots.default && slots.default()}</Fragment>
            }
            return props.empty
        }
    }
})
</script>

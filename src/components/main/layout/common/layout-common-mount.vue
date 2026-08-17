<script lang="tsx">
import { defineComponent, Fragment } from 'vue'
import { useNotification, useLoadingBar, useDialog, useMessage } from 'naive-ui'

export default defineComponent({
    name: 'LayoutCommonMount',
    setup(props, { slots }) {
        window.$loadingBar = useLoadingBar()
        window.$message = useMessage()
        window.$notification = useNotification()
        window.$dialog = useDialog()

        return () => <Fragment>{slots.default && slots.default()}</Fragment>
    }
})
</script>

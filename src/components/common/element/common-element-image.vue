<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CommonElementImage',
    props: {
        src: { type: String }
    },
    setup(props, ctx) {
        return () => <n-image class="common-element-image" src={props.src}></n-image>
    }
})
</script>

<style lang="scss" scoped>
.common-element-image.n-image {
    position: relative;
    :deep(img) {
        display: block;
    }
}
</style>

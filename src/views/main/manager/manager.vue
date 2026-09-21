<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BaseManager',
    setup() {
        return () => (
            <layout-common-container class="absolute inset-0 flex-wrap">
                <div class="flex flex-wrap gap-10 p-20">
                    {[
                        'default',
                        'primary',
                        'info',
                        'success',
                        'warning',
                        'error',
                        'red',
                        'orange',
                        'green',
                        'cyan',
                        'blue',
                        'geekblue',
                        'purple',
                        'pink',
                        'volcano',
                        'gray'
                    ].map(type => (
                        <common-base-chunk bordered value type={type}>
                            {type}
                        </common-base-chunk>
                    ))}
                </div>
            </layout-common-container>
        )
    }
})
</script>

<script lang="tsx">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'MainManagerSummary',
    setup(props, ctx) {
        return () => (
            <div class="main-manager-summary line-height-24 select-none">
                <n-grid cols="0:1 400:1 816:2 1232:3 1648:4 4" x-gap={16} y-gap={16} item-responsive>
                    <n-grid-item span={1}>
                        <common-element class-name="flex items-center gap-20">
                            <n-icon-wrapper size={64} border-radius={6}>
                                <common-element-icon size={32} name="nest-logo"></common-element-icon>
                            </n-icon-wrapper>
                            <div class="flex flex-col">
                                <n-h1 class="m-0 line-height-40">0</n-h1>
                                <n-text depth={3} class="text-16 line-height-24">
                                    我的客户
                                </n-text>
                            </div>
                        </common-element>
                    </n-grid-item>
                    <n-grid-item span={1}>
                        <common-element class-name="flex items-center gap-20">
                            <n-icon-wrapper size={64} border-radius={6}>
                                <common-element-icon size={32} name="nest-logo"></common-element-icon>
                            </n-icon-wrapper>
                            <div class="flex flex-col">
                                <n-h1 class="m-0 line-height-40">0</n-h1>
                                <n-text depth={3} class="text-16 line-height-24">
                                    今日新增客户
                                </n-text>
                            </div>
                        </common-element>
                    </n-grid-item>
                    <n-grid-item span={1}>
                        <common-element class-name="flex items-center gap-20">
                            <n-icon-wrapper size={64} border-radius={6}>
                                <common-element-icon size={32} name="nest-logo"></common-element-icon>
                            </n-icon-wrapper>
                            <div class="flex flex-col">
                                <n-h1 class="m-0 line-height-40">0</n-h1>
                                <n-text depth={3} class="text-16 line-height-24">
                                    今日发送报价
                                </n-text>
                            </div>
                        </common-element>
                    </n-grid-item>
                    <n-grid-item span={1}>
                        <common-element class-name="flex items-center gap-20">
                            <n-icon-wrapper size={64} border-radius={6}>
                                <common-element-icon size={32} name="nest-logo"></common-element-icon>
                            </n-icon-wrapper>
                            <div class="flex flex-col">
                                <n-h1 class="m-0 line-height-40">0</n-h1>
                                <n-text depth={3} class="text-16 line-height-24">
                                    待完成任务
                                </n-text>
                            </div>
                        </common-element>
                    </n-grid-item>
                </n-grid>
            </div>
        )
    }
})
</script>

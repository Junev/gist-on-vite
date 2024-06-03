<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-card style="box-sizing: border-box; height: 100vh" body-style="box-sizing: border-box; height: 100%;">
          <div class="page">
            <h3 class="title">
              <slot name="leftTitle"></slot>
            </h3>
            <div class="sLine"></div>
            <div ref="leftScroll" style="flex: 1 0 auto">
              <el-scrollbar :height="leftHeight">
                <slot name="leftContent"></slot>
              </el-scrollbar>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card style="box-sizing: border-box; height: 100vh" body-style="box-sizing: border-box; height: 100%;">
          <div class="page">
            <h3 class="title">
              <slot name="rightTitle"></slot>
            </h3>
            <div class="sLine"></div>
            <div ref="rightScroll" style="flex: 1 1 auto; overflow: hidden;">
              <el-scrollbar :height="rightHeight" >
                <template v-if="rightHeight">
                  <slot name="rightContent"></slot>
                </template>
              </el-scrollbar>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import useResizeHeight from '~/composables/useResizeHeight.ts'

const leftScroll = ref(null)
const rightScroll = ref(null)

const leftHeight = ref(0);
const { height: rightHeight } = useResizeHeight(rightScroll);

</script>

<style>

.title {
  margin-top: 0;
  margin-bottom: 6px;
}
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>

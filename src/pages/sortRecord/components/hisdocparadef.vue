<template>
  <el-table ref="table" :data="data" row-key="PROPERTYID" :loading="loading">
    <el-table-column width="60">
      <div class="my-handle"><el-icon style="width: 24px">
          <Rank />
        </el-icon></div>
    </el-table-column>
    <el-table-column prop="EQUIPMENTID" label="EQUIPMENTID" />
    <el-table-column prop="PROPERTYID" label="PROPERTYID" />
    <el-table-column prop="PROPERTYNAME" label="PROPERTYNAME" />
    <el-table-column prop="SHOWINDEX" label="SHOWINDEX" />
  </el-table>
  <div class="tool">
    <el-button type="primary" @click="save">保存</el-button>
  </div>
</template>

<script setup>
import { Rank } from '@element-plus/icons-vue';
import { ref } from 'vue'
import { ElMessage } from 'element-plus';

const table = ref()
const data = ref([])
const sortedKey = ref([])
const loading = ref(false);

function loadTableData() {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "V_HISDOCPARADEF",
      cons: [{ cn: "EQUIPMENTID", cp: "=", v1: "900101", v2: null }],
      orderby: 'SHOWINDEX asc'
    }
  }
  fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.s === -1) {
        location.href = 'login.html'
      }
      data.value = res.d
    })
    .catch(e => {
      console.error(e)
    })
}

onMounted(() => {
  loadTableData()
})

onMounted(() => {
  const el = table.value.$refs.tableBody.querySelector("tbody")
  new Sortable(el, {
    // dataIdAttr: '',
    animation: 150,
    ghostClass: 'blue-background-class',
    handle: ".my-handle",
    onEnd: function (e) {
      const a = e.target.querySelectorAll(".el-table_1_column_3 .cell")
      const b = [...a].map(c => c.innerText)
      sortedKey.value = b
    }
  })
})

function save() {
  loading.value = true;
  if (sortedKey.value.length === 0) {
    return
  }
  const reqData = sortedKey.value.map((c, i) => ({ PROPERTYID: c, SHOWINDEX: i }))
  const res = reqData.map(data => {
    const reqBody = {
      "t": "mdb\\save",
      "i": sessionStorage.getItem("sid"),
      "d": {
        "model": "HISDOCPARADEF",
        "values": { PROPERTYID: data.PROPERTYID, SHOWINDEX: data.SHOWINDEX },
        "cons": [{ cn: 'PROPERTYID', cp: '=', v1: data.PROPERTYID, v2: null }]
      }
    }
    fetch('/mdb', {
      method: 'POST',
      body: JSON.stringify(reqBody)
    })
      .then(c => c.json())
      .then(res => {
        if (res.s === 0) {
          return Promise.resolve()
        }
      })
  })
  
  Promise.all(res).then(() => {
    ElMessage.success('保存成功！')
    loadTableData()
    loading.value = false
  })


}
</script>

<style>
.blue-background-class {
  background-color: #C8EBFB !important;
}

.my-handle {
  padding: 4px 12px;
}

.tool {
  margin: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
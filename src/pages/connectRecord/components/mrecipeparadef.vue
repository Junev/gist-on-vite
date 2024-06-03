<template>
  <div class="container">
    <div class="tool">
      <el-form inline>
        <el-form-item label="工序单元">
          <el-select v-model:model-value="unitId">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryData">查询</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
    <div class="main">
      <div class="treeWrapper">
        <el-tree ref="treeRef" class="tree" :allow-drop="allowDrop" :allow-drag="allowDrag" :data="itemsData" draggable
                 default-expand-all node-key="DATAITEMID" :expand-on-click-node="false" height="100%" highlight-current />
      </div>
      <div class="tableWrapper">
        <el-table ref="table" :data="propertyData" row-key="PROPERTYID" :loading="loading" border height="100%">
          <el-table-column prop="EQUIPMENTID" label="EQUIPMENTID" />
          <el-table-column prop="PROPERTYID" label="PROPERTYID" />
          <el-table-column prop="PROPERTYNAME" label="PROPERTYNAME" />
          <el-table-column width="80">
            <template #default="scope">
              <el-button type="default" @click="addConnection(scope.row)">+</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Rank } from '@element-plus/icons-vue';
import { ref } from 'vue'
import { ElMessage } from 'element-plus';

const unitId = ref('900101')
const options = ref([])
const treeRef = ref()
const table = ref()
const itemsData = ref([])
const propertyData = ref([])
const allPropertyData = ref([])
const sortedKey = ref([])
const loading = ref(false);

function loadItemsTableData() {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "MRECIPEDATAITEM",
      cons: [{ cn: "TREENODEID", cp: "=", v1: unitId.value, v2: null }],
      orderby: "DATAITEMID asc"
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.m.includes("invalid")) {
        location.href = 'login.html'
      }

      itemsData.value = res.d.map(c => ({
        ...c,
        label: c.DATAITEMID + '__' + c.DATAITEMNAME,
        children: []
      }))
      itemsData.value.forEach(c => {
        loadItemsChildren(c.DATAITEMID)
          .then(d => {
            c.children = d?.map(k => {
              const p = allPropertyData.value.find(c => c.PROPERTYID === k.PROPERTYID)
              if (p) {
                return ({
                  label: p.PROPERTYID + '__' + p.PROPERTYNAME,
                  PROPERTYID: p.PROPERTYID
                })
              }
              return {
                label: k.PROPERTYID,
                PROPERTYID: k.PROPERTYID
              }
            })
          })
      })
    })
    .catch(e => {
      console.error(e)
    })
}

function loadItemsChildren(dataitemId) {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "MRECIPEPARADEF",
      cons: [{ cn: "DATAITEMID", cp: "=", v1: dataitemId, v2: null }],
      orderby: "PROPERTYID asc"
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.m.includes("invalid")) {
        location.href = 'login.html'
      }
      return res.d
    })
    .catch(e => {
      console.error(e)
    })
}

function loadItems() {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "MRECIPEPARADEF",
      cons: [{ cn: "EQUIPMENTID", cp: "=", v1: unitId.value, v2: null }],
      orderby: "PROPERTYID asc"
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.m.includes("invalid")) {
        location.href = 'login.html'
      }
      return res.d
    })
    .catch(e => {
      console.error(e)
    })
}

function loadPropertyTableData() {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "PDS_EQUIPPROPERTY",
      cons: [{ cn: "EQUIPMENTID", cp: "=", v1: unitId.value, v2: null },
      { cn: "PROPERTYGROUP", cp: "in", v1: [3, 4, 7], v2: null },
      ],
      orderby: "PROPERTYID asc"
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.m.includes("invalid")) {
        location.href = 'login.html'
      }
      loadItems().then(items => {
        propertyData.value = res.d.filter(c => !items.find(k => k.PROPERTYID === c.PROPERTYID))
      })
    })
    .catch(e => {
      console.error(e)
    })
}

function loadAllPropertyData() {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "PDS_EQUIPPROPERTY",
      cons: [{ cn: "EQUIPMENTID", cp: "=", v1: unitId.value, v2: null }],
      orderby: "PROPERTYID asc"
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.m.includes("invalid")) {
        location.href = 'login.html'
      }
      allPropertyData.value = res.d
      return res.d
    })
    .catch(e => {
      console.error(e)
    })
}


function allowDrag(draggingNode) {
  return !!draggingNode.data.PROPERTYID;
}

function allowDrop(draggingNode, dropNode, type) {
  if (type === 'prev' || type === 'next') {
    return false;
  }
  return !!dropNode.data.DATAITEMID;
}

function queryData() {
  loadAllPropertyData()
  loadItemsTableData().then(() => {
    loadPropertyTableData()
  })
}

function loadUnits() {
  const req = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "PDS_EQUIPELEMENT",
      cons: [{ cn: "EE_LEVEL", cp: "=", v1: 4, v2: null }],
      orderby: "EQUIPMENTID asc"
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(req)
  }).then(res => res.json())
    .then(res => {
      if (res.m.includes("invalid")) {
        location.href = 'login.html'
      }
      options.value = res.d.map(c => ({
        label: c.EQUIPMENTID + "__" + c.EQUIPMENTNAME,
        value: c.EQUIPMENTID
      }))
      return res.d
    })
    .catch(e => {
      console.error(e)
    })
}


onMounted(() => {
  loadUnits();
})

function addConnection(property) {
  const currentDATAITEM = treeRef.value.getCurrentKey();
  if (!currentDATAITEM) {
    ElMessage.message({
      type: 'error',
      message: '没有选择要添加的父节点'
    })
    return
  }
  const reqBody = {
    "t": "mdb\\add",
    "i": sessionStorage.getItem("sid"),
    "d": {
      "model": "MRECIPEPARADEF",
      "values": {
        EQUIPMENTID: property.EQUIPMENTID,
        PROPERTYID: property.PROPERTYID,
        DATAITEMID: currentDATAITEM
      },
    }
  }
  return fetch('/mdb', {
    method: 'POST',
    body: JSON.stringify(reqBody)
  })
    .then(c => c.json())
    .then(res => {
      if (res.s === 0) {
        return Promise.resolve()
      }
    }).then(() => queryData())
}

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
    loadPropertyTableData()
    loading.value = false
  })


}
</script>

<style>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.main {
  width: 100%;
  display: flex;
  height: calc(100% - 66px);
}

.treeWrapper {
  width: 50%;
  border-right: 1px solid black;
  box-sizing: border-box;
  border-top: 1px solid #EBEEF5;
}

.tree {
  height: 100%;
  overflow: auto;
}

.tableWrapper {
  width: 50%;
}

.el-tree>.el-tree-node>div.el-tree-node__content>span {
  color: dodgerblue;
}

.blue-background-class {
  background-color: #C8EBFB !important;
}

.my-handle {
  padding: 4px 12px;
}

.tool {
  width: 100%;
  padding: 16px 16px 0 16px;
  display: flex;
  justify-content: space-between;
}
</style>
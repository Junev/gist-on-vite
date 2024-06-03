<template>
  <ElForm style="margin: 16px" :model="form" label-width="100px">
    <ElRow>
      <ElCol :span="8">
        <ElFormItem label="切丝开始时间" required>
          <ElDatePicker style="width: 100px" type="datetimerange" format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" :shortcuts="shortcuts" :disabled-date="disabledDate"
                        :default-time="defaultTime" clearable v-model="form.startTime1" @change="datetimeChange1">
          </ElDatePicker>
        </ElFormItem>
      </ElCol>
      <ElCol :span="4">
        <ElFormItem label="牌号" required>
          <ElSelect style="width: 300px" filterable clearable v-model="form.productId" @change="productIdChange">
            <ElOption v-for="m in productIdOptions" :key="m.value" :label="m.label" :value="m.value" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :span="6">
        <ElFormItem label="叶丝批次" required>
          <ElSelect style="width: 300px" multiple collapse-tags filterable clearable v-model="form.batchIds">
            <ElOption v-for="b in batchOptions1" :key="b.value" :label="b.label" :value="b.value" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :span="6">
        <div class="buttons">
          <ElButton type="primary" v-loading.fullscreen="loading" @click="onSubmit">查询</ElButton>
          <el-button @click="download">下载</el-button>
        </div>
      </ElCol>
    </ElRow>
  </ElForm>
</template>

<script setup>
import dayjs from 'dayjs';
import { countBy, findLast } from 'lodash';

const emit = defineEmits(["update:tableData", "update:productId"]);

const shortcuts = [
  {
    text: "最近1小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000);
      return [start, end];
    },
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

const timeFormat = "YYYY-MM-DD HH:mm:ss";
const defaultTime = [dayjs().startOf("day"), dayjs().endOf("day")];

const allBatchIds = ref([]);
const productIdOptions = ref([]);
const batchOptions1 = ref([]);

const loading = ref(false);

const form = reactive({
  startTime1: [
    dayjs().subtract(30, "day").startOf("day").format(timeFormat),
    dayjs().subtract(1, "day").endOf("day").format(timeFormat),
  ],
  productId: [],
  batchIds: [],
});

const productName = ref('');

const disabledDate = (date) =>
  date.getTime() > new Date(dateTrans(Date.now()).substring(0, 10) + " 23:59:59").getTime();

function datetimeChange1() {
  const reqBody = {
    "t": "mdb\\get",
    "i": sessionStorage.getItem("sid"),
    "d": {
      model: "V_REPORT_LIQUN_FILTER",
      cons: [{ cn: "EXESTARTTIME", cp: "between", v1: form.startTime1[0], v2: form.startTime1[1] }],
      orderby: 'BATCHID asc'
    }
  }
  fetch('/api', {
    method: 'POST',
    body: JSON.stringify(reqBody)
  })
    .then(c => c.json())
    .then(res => {
      if (res.m.includes('invalid')) {
        location.href = '/login.html'
      }
      if (res.s === 0) {
        allBatchIds.value = res.d
      }
      fetchProductList()
    })
}

function fetchProductList() {
  const allMat = allBatchIds.value.reduce((pre, cur) => {
    pre[cur.PRODUCTID] = cur.MAT_NAME
    return pre;
  }, {})

  productIdOptions.value = Object.entries(allMat).filter(c => c[1].includes('利群')).map(c => ({ label: c[1], value: c[0] }))
}

function productIdChange(selectedProductId) {
  emit("update:productId", selectedProductId)
  const matName = allBatchIds.value.find(c => c.PRODUCTID === selectedProductId)?.MAT_NAME
  if (matName) {
    productName.value = matName.replace("烟丝 ","")
  }
  batchOptions1.value = allBatchIds.value
    .filter(c => c.PRODUCTID === selectedProductId)
    .map(({ BATCHID, MAT_NAME }) => ({ label: MAT_NAME + "__" + BATCHID, value: BATCHID }))
  form.batchIds = batchOptions1.value.map(c => c.value)
}

onMounted(() => {
  datetimeChange1()
  fetchProductList()
})

function formatStandard({ upperLimitV, standardV, lowerLimitV, engrunits }) {
  if (isNumber(upperLimitV) && isNumber(standardV) && isNumber(lowerLimitV) &&
    (upperLimitV != lowerLimitV) &&
    (Math.round(100 * (upperLimitV - standardV)) == Math.round(100 * (standardV - lowerLimitV)))) {
    return standardV + '±' + (Math.round(100 * (upperLimitV - standardV)) / 100).toFixed(2) + (engrunits || '');
  } else if (isNumber(upperLimitV) && !standardV && !lowerLimitV) {
    return '≤' + upperLimitV + (engrunits || '');
  } else if (isNumber(lowerLimitV) && !standardV && !upperLimitV) {
    return '≥' + lowerLimitV + (engrunits || ''); 
  } else if (upperLimitV === lowerLimitV && upperLimitV === standardV) {
    return standardV + engrunits + '';
  } else if(isNumber(standardV) && isNumber(standardV) && isNumber(standardV)) {
    return upperLimitV + ';' + standardV + ';' + lowerLimitV;
  } else if (standardV) {
    return standardV + engrunits + '';
  } else {
    return upperLimitV + ';' + standardV + ';' + lowerLimitV;
    return '/'
  }
}

function onSubmit() {
  loading.value = true;
  const reqBody = {
    "t": "modulefun\\report_liqun",
    "i": sessionStorage.getItem("sid"),
    "d": {
      "startTime": "2023-10-01 23:22:23",
      "endTime": "2023-10-20 00:00:00",
      batchIds: form.batchIds
    }
  }

  fetch('/api', {
    method: 'POST',
    body: JSON.stringify(reqBody)
  })
    .then(c => c.json())
    .then(res => {
      if (res.m.includes('invalid')) {
        location.href = '/login.html'
      }
      if (res.s === 0) {
        let tableData = Object.values(res.d)
        const col1Counts = countBy(tableData, c => c.exeStartTime)
        tableData.forEach(c => {
          c.brandName = c.brandName.replace("烟丝 ", "")
          c.span0 = {
            rowspan: 0,
            colspan: 1
          }
        })
        Object.keys(col1Counts).forEach(c => {
          const row = tableData.find(r => r.exeStartTime === c)
          row.span0 = {
            rowspan: col1Counts[c],
            colspan: 1
          }
        })

        const standard = Object.keys(tableData[0]).reduce((prev, cur) => {
          const r = tableData[tableData.length > 0 ? tableData.length - 1: 0]
          const temp = {
            upperLimitV: r?.[cur]?.upperlimitv,
            standardV: r?.[cur]?.standardv,
            lowerLimitV: r?.[cur]?.lowerlimitv,
            engrunits: r?.[cur]?.engrunits
          }
          if (cur === 'qua2003u0141') {
            console.log(r)
            
          }
          prev[cur] = formatStandard(temp)
          return prev
        }, {})

        emit("update:data", { tableData, standard })
      }
      loading.value = false;
    })
}

function download() {
  const tableDom = document.querySelector(".el-table");
  const worksheet = XLSX.utils.table_to_sheet(tableDom);
  worksheet["!freeze"] =  {
      state: "frozen",
      xSplit: 4,
      ySplit: 4,
      topLeftCell: "E5",
      activePane: "bottomRight",
    }
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const borderStyle = {
    border: {
          top: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
    }
  }
  const maxCol = XSU.getMaxCol(workbook, "Sheet1")
  for(let i = 0; i <= maxCol; i++) {
    const rowName = XLSX.utils.encode_col(i)
    for (let j = 1; j <= 4; j++) {
      if(!worksheet[rowName+j]) {
        worksheet[rowName+j] = {
          t: 's',
          v: '',
        }
      }
      worksheet[rowName+j].s = {
        ...borderStyle,
        fill: {
          fgColor: {
            rgb:'D9D9D9'
          }
        },
        font: {
          bold: true,
          name: '华文楷体',
          sz: '11'
        }
      }
    }
  }
  Object.entries(worksheet).forEach(([k,v]) => {
    const {r, c} = XLSX.utils.decode_cell(k)
    if (r >= 4) {
      v.s = {
        font: {
          name: '华文楷体',
          sz: '13'
        }
      }
    }
  })
  XSU.setColWidth(
    workbook,
    "Sheet1",
    [{ wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 12 }].concat(
      new Array(maxCol).fill({ wch: 12 })
    )
  );
  XSU.setAlignmentStylesAll(workbook, "Sheet1", { vertical: "center", horizontal: "center", wrapText: true });
  const wbout = xlsxStyle.write(workbook, { bookType: "xlsx", bookSST: false, type: "binary" });
  saveAs(
    new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
    `${productName.value}-${dayjs().format("YYYY-MM-DD")}.xlsx`)
}
</script>

<style>
.buttons {
  padding-left: 100px;
}
</style>
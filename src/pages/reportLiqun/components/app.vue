<template>
  <div ref="container" class="container">
    <div ref="searchBar" class="search_bar"><SearchBar @update:productId="setProductId" @update:data="setTableData"></SearchBar></div>
    <div ref="tableContainer" class="table_container">
      <ReportTableLiqunChangZui :height="height" :tableData="tableData" :standard="standard"/>
    </div>
  </div>
</template>

<script>
import SearchBar from './SearchBar.vue';
import ReportTableLiqunChangZui from './ReportTableLiqunChangZui.vue';
import ReportTableLiqunXinBan from './ReportTableLiqunXinBan.vue';

export default {
  name: "report_liqun",
  components: {
    SearchBar,
    ReportTableLiqunChangZui,
    ReportTableLiqunXinBan,
},
  data() {
    return {
      height: '300px',
      productId: '',
      tableData: [],
      standard: {}
    }
  },
  mounted() {
    this.computeHeight()
  },
  updated() {
    this.computeHeight()
  },
  methods: {
    computeHeight() {
      let a = this.$refs.container.getBoundingClientRect().height;
      let b = this.$refs.searchBar.getBoundingClientRect().height;
      let c = this.$refs.tableContainer.getBoundingClientRect().height;
      let d = (a - b - 20).toFixed(0) + 'px';
      this.height = d;
      this.$refs.tableContainer.style.height  = d;
    },
    setProductId(productId) {
      this.productId = productId
    },
    setTableData(res) {
      this.tableData = res.tableData
      this.standard = res.standard
    } 
  }
}
</script>

<style>
.container {
  display: flow-root;
  height: 100%;
}
.search_bar {
  height: 60px;
}
</style>
<template>
  <el-table id="statistic-table" :data="tableData" row-key="BATCHID" :height="height" style="width: 100%"
            :header-row-class-name="headerRowClassName" :span-method="tableSpanMethod" bordered>
    <el-table-column fixed prop="exeStartTime" label="切丝日期" width="140" />
    <el-table-column fixed prop="brandName" label="品牌名称" width="120" />
    <el-table-column fixed prop="batchId" label="批次号" width="120" />
    <el-table-column fixed prop="batchSize" label="批投料量 (kg)" width="85" />
    <el-table-column label="松散回潮">
      <el-table-column label="水分">
        <el-table-column :label="standard.qua2003u0097">
          <el-table-column label="均值" prop="qua2003u0097.avgv" />
          <el-table-column label="SD" prop="qua2003u0097.stdv" />
        </el-table-column>
        <!-- <el-table-column label="P    (合格率)" prop="qua2003u0097.p"/> -->
      </el-table-column>
      <el-table-column label="温度" prop="qua2003u0098.avgv">
        <el-table-column :label="standard.qua2003u0098">
          <el-table-column label="均值" prop="qua2003u0098.avgv" />
          <el-table-column label="SD" prop="qua2003u0098.stdv" />
        </el-table-column>
      </el-table-column>
      <!-- <el-table-column label="热风温度">
        <el-table-column :label="standard.qua2003u0085">
          <el-table-column label="均值" prop="qua2003u0085.avgv" />
          <el-table-column label="SD" prop="qua2003u0085.stdv"/>
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua2003u0085.cpkv"/>
        </el-table-column>
      </el-table-column> -->
      <el-table-column label="回风温度">
        <el-table-column :label="standard.qua2003u0091">
          <el-table-column label="均值" prop="qua2003u0091.avgv" />
          <el-table-column label="SD" prop="qua2003u0091.stdv" />
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua2003u0091.cpkv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="累计加水量 (L)" prop="prod2003u0093.avgv"/>
      <!-- <el-table-column label="瞬时加水量 (L/h)" prop="qua2003u0094.avgv" /> -->
      <el-table-column label="皮带秤累计量" prop="prod2003u0081.avgv"></el-table-column>
    </el-table-column>
    <el-table-column label="加料润叶">
      <el-table-column label="皮带秤">
        <el-table-column :label="standard.qua2003u0100">
          <el-table-column label="流量均值" prop="qua2003u0100.avgv" />
          <el-table-column label="流量SD" prop="qua2003u0100.stdv" />
        </el-table-column>
        <el-table-column label="累计量" prop="prod2003u0101.avgv"></el-table-column>
      </el-table-column>
      <el-table-column label="水分">
        <el-table-column :label="standard.qua2003u0129">
          <el-table-column label="均值" prop="qua2003u0129.avgv" />
          <el-table-column label="SD" prop="qua2003u0129.stdv" />
        </el-table-column>
        <el-table-column>
          <el-table-column label="P (合格率)" prop="qua2003u0129.p" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="温度">
        <el-table-column :label="standard.qua2003u0130">
          <el-table-column label="均值" prop="qua2003u0130.avgv" />
          <el-table-column label="SD" prop="qua2003u0130.stdv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="瞬时精度">
        <el-table-column :label="standard.qua2003u0141">
          <el-table-column label="均值" prop="qua2003u0141.avgv" />
          <el-table-column label="SD" prop="qua2003u0141.stdv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="累计精度">
        <el-table-column label="±0.5%" prop="prod2003u0131.avgv"></el-table-column>
      </el-table-column>
      <!-- <el-table-column label="雾化蒸汽压力 0.2Mpa" /> -->
      <el-table-column label="实际精度"></el-table-column>
      <el-table-column label="实际精度绝对值"></el-table-column>
      <!-- <el-table-column label="累计加水量" prop="prod2003u0123.avgv"></el-table-column> -->
      <el-table-column label="料液">
        <el-table-column label="累计加料量" prop="prod2003u0122.avgv"></el-table-column>
      </el-table-column>
    </el-table-column>
    <el-table-column label="二次加料">
      <!-- <el-table-column label="一级贮叶时间 (0-12h)"></el-table-column> -->
      <el-table-column label="入口水分">
        <el-table-column :label="standard.qua2004u0105" prop="qua2004u0105.avgv">
        </el-table-column>
      </el-table-column>
      <el-table-column label="累计加水量 (L)" prop="prod2004u0101.avgv">
      </el-table-column>
      <el-table-column label="出口水分">
        <el-table-column :label="standard.qua2004u0106" prop="qua2004u0106.avgv">
        </el-table-column>
      </el-table-column>
    </el-table-column>
    <el-table-column label="烘丝前">
      <el-table-column label="二级贮叶时间 (4-36h)" prop="p0134.avgv"/>
      <el-table-column label="Sirox增温增湿">
        <el-table-column :label="standard.qua3002u0091">
          <el-table-column label="均值" prop="qua3002u0091.avgv" />
          <el-table-column label="SD" prop="qua3002u0091.stdv" />
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua3002u0091.cpkv" />
        </el-table-column>
        <el-table-column label="P (合格率)" prop="qua3002u0091.p" />
        <el-table-column :label="'薄膜阀开度' + '  ' + standard.qua3002u0085" prop="qua3002u0085.avgv" />
        <el-table-column label="阀门开度SD" prop="qua3002u0085.stdv" />
        <el-table-column label="蒸汽流量">
          <el-table-column :label="standard.qua3002u0084" prop="qua3002u0084.avgv" />
        </el-table-column>
        <el-table-column label="流量SD" prop="qua3002u0084.stdv" />
        <el-table-column :label="'减压阀后蒸汽压力' + '  ' + standard.qua3002u0083" prop="qua3002u0083.avgv" />
        <el-table-column :label="'喷射蒸汽压力' + '  ' + standard.qua3002u0086" prop="qua3002u0086.avgv" />
        <el-table-column label="出口温度">
          <el-table-column :label="'均值' + standard.qua3002u0087" prop="qua3002u0087.avgv" />
          <el-table-column label="SD" prop="qua3002u0087.stdv" />
          <el-table-column label="CPK ≥1" prop="qua3002u0087.cpkv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="皮带秤">
        <el-table-column :label="standard.qua3002u0088">
          <el-table-column label="流量均值" prop="qua3002u0088.avgv" />
          <el-table-column label="流量SD" prop="qua3002u0088.stdv" />
        </el-table-column>
        <el-table-column label="累计量" prop="prod3002u0089.avgv" />
      </el-table-column>
    </el-table-column>
    <el-table-column label="烘丝">
      <el-table-column label="热风">
        <el-table-column label="热风风速">
          <el-table-column :label="standard.qua3002u0097" prop="qua3002u0097.avgv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="排潮">
        <el-table-column label="排潮负压">
          <el-table-column :label="standard.qua3002u0100" prop="qua3002u0100.avgv" />
        </el-table-column>
        <el-table-column label="排潮风门开度均值" prop="qua3002u0111.avgv" />
        <el-table-column label="排潮风门SD" prop="qua3002u0111.stdv" />
      </el-table-column>
      <el-table-column label="筒壁温度">
        <el-table-column :label="standard.qua3002u0099">
          <el-table-column label="温度均值" prop="qua3002u0099.avgv" />
          <el-table-column label="温度SD" prop="qua3002u0099.stdv" />
          <el-table-column label="CPK" prop="qua3002u0099.cpkv" />
        </el-table-column>
        <el-table-column label="≥98%">
          <el-table-column label="温度合格率" prop="qua3002u0099.p" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="热风温度">
        <el-table-column :label="standard.qua3002u0098">
          <el-table-column label="均值" prop="qua3002u0098.avgv" />
          <el-table-column label="SD" prop="qua3002u0098.stdv" />
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua3002u0098.cpkv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="烘后水分">
        <el-table-column :label="standard.qua3002u0102">
          <el-table-column label="均值" prop="qua3002u0102.avgv" />
          <el-table-column label="SD" prop="qua3002u0102.stdv" />
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua3002u0102.cpkv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="烘后温度">
        <el-table-column :label="standard.qua3002u0103">
          <el-table-column label="均值" prop="qua3002u0103.avgv" />
          <el-table-column label="SD" prop="qua3002u0103.stdv" />
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua3002u0103.cpkv" />
        </el-table-column>
      </el-table-column>
    </el-table-column>
    <el-table-column label="冷却风选">
      <el-table-column label="出口水分">
        <el-table-column :label="standard.qua3002u0109" prop="qua3002u0109.avgv" />
      </el-table-column>
      <el-table-column label="出口温度">
        <el-table-column :label="standard.qua3002u0110" prop="qua3002u0110.avgv" />
      </el-table-column>
    </el-table-column>
    <el-table-column label="膨丝结构">
      <el-table-column label="填充值">
        <el-table-column label="≥6.5 cm3/g" prop="p0051.avgv" />
      </el-table-column>
      <el-table-column label="整丝率">
        <el-table-column label="≥70%" prop="p0052.avgv" />
      </el-table-column>
      <el-table-column label="碎丝率">
        <el-table-column label="≤3.0%" prop="p0053.avgv" />
      </el-table-column>
    </el-table-column>
    <el-table-column label="掺配">
      <el-table-column label="叶丝重量" prop="prod9001u0081.avgv" />
      <el-table-column label="膨丝掺配">
        <el-table-column label="膨胀烟丝" prop="prod9001u0099.avgv" />
        <el-table-column :label="'瞬时精度' + ' ' + standard.qua9001u0128">
          <el-table-column label="均值" prop="qua9001u0128.avgv" />
          <el-table-column label="SD" prop="qua9001u0128.stdv" />
        </el-table-column>
        <el-table-column label="累计精度">
          <el-table-column label="±0.5%" prop="prod9001u0100.avgv" />
        </el-table-column>
        <el-table-column label="实际精度" />
        <!-- prop="p0036.avgv" -->
        <el-table-column label="实际精度绝对值" />
        <!-- prop="p0036.absv" -->
      </el-table-column>
      <el-table-column label="回用烟丝掺配">
        <el-table-column :label="'瞬时精度' + ' ' + standard.reuse_instant_accuracy">
          <el-table-column label="均值" prop="reuse_instant_accuracy.avgv" />
          <el-table-column label="SD" prop="reuse_instant_accuracy.stdv" />
        </el-table-column>
        <el-table-column label="累计精度">
          <el-table-column label="±0.5%" prop="reuse_total_accuracy.avgv" />
        </el-table-column>
        <el-table-column label="残丝重量" prop="reuse_total_weight.avgv" />
        <el-table-column label="残丝比例">
          <el-table-column label="≤1.5%" prop="reuse_total_rate.avgv" />
        </el-table-column>
      </el-table-column>
    </el-table-column>
    <el-table-column label="加香">
      <el-table-column label="皮带秤">
        <el-table-column :label="standard.qua9002u0080">
          <el-table-column label="流量均值" prop="qua9002u0080.avgv" />
          <el-table-column label="SD" prop="qua9002u0080.stdv" />
        </el-table-column>
        <el-table-column label="累计烟丝量" prop="prod9002u0081.avgv" width="100"/>
      </el-table-column>
      <el-table-column label="香精">
        <el-table-column label="累计加香量" prop="aroma_total_weight.avgv" />
      </el-table-column>
      <el-table-column label="水分">
        <el-table-column :label="standard.qua9002u0091">
          <el-table-column label="均值" prop="qua9002u0091.avgv" />
          <el-table-column label="SD" prop="qua9002u0091.stdv" />
        </el-table-column>
        <el-table-column label="≥1">
          <el-table-column label="CPK" prop="qua9002u0091.cpkv" />
        </el-table-column>
        <el-table-column label="P (合格率)" prop="qua9002u0091.p" />
      </el-table-column>
      <el-table-column label="瞬时精度">
        <el-table-column :label="standard.aroma_instant_accuracy">
          <el-table-column label="均值" prop="aroma_instant_accuracy.avgv" />
          <el-table-column label="SD" prop="aroma_instant_accuracy.stdv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="累计精度">
        <el-table-column label="±0.5%" prop="aroma_total_accuracy.avgv" />
      </el-table-column>
      <el-table-column label="实际精度" />
      <el-table-column label="实际精度绝对值" />
      <el-table-column label="雾化压空压力">
        <el-table-column label="1.6Bar" />
      </el-table-column>
    </el-table-column>
    <el-table-column label="加香后结构">
      <el-table-column label="整丝率">
        <el-table-column label="≥80%" prop="p0054.avgv" />
      </el-table-column>
      <el-table-column label="填充值">
        <el-table-column label="5.3±0.2cm3/g" prop="p0055.avgv" />
      </el-table-column>
      <el-table-column label="碎丝率">
        <el-table-column label="≤2.0%" prop="p0056.avgv" />
      </el-table-column>
    </el-table-column>
    <el-table-column label="转序检验">
      <el-table-column label="水份">
        <el-table-column label="11.7±0.5%" prop="p0057.avgv" />
      </el-table-column>
      <el-table-column label="填充值">
        <el-table-column label="5.4±0.2cm3/g" prop="p0058.avgv" />
      </el-table-column>
      <el-table-column label="整丝率">
        <el-table-column label="≥80%    调整后≥75%" prop="p0059.avgv" />
      </el-table-column>
      <el-table-column label="碎丝率">
        <el-table-column label="≤2.0%" prop="p0060.avgv" />
      </el-table-column>
    </el-table-column>
    <el-table-column label="温湿度（按班次记录）">
      <el-table-column label="储叶房">
        <el-table-column label="30±2℃">
          <el-table-column label="温度" prop="qua2004u0123.avgv" />
        </el-table-column>
        <el-table-column label="70±5%">
          <el-table-column label="湿度" prop="qua2004u0122.avgv" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="储丝房">
        <el-table-column label="26±3℃">
          <el-table-column label="温度" prop="qua9002u0123.avgv" />
        </el-table-column>
        <el-table-column label="60±5%">
          <el-table-column label="湿度" prop="qua9002u0124.avgv" />
        </el-table-column>
      </el-table-column>
    </el-table-column>
    <el-table-column label="三级站成品水分检测数据">
      <el-table-column label="11.8±0.5%">
        <el-table-column label="早班" prop="p0065.avgv" />
        <el-table-column label="中班" prop="p0066.avgv" />
      </el-table-column>
    </el-table-column>
  </el-table>
</template>

<script setup>
const props = defineProps({
  height: String,
  tableData: Array,
  standard: Object
});


function headerRowClassName() {
  return 'table-header'
}

const tableSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    return row.span0
  }
}


</script>

<style>
.table-header .cell {
  text-align: center;
}
</style>
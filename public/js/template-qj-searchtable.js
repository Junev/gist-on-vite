var StopRecord = new Vue({ //树的VUE对象
    el: "#StopRecord",
    data() {
        return {
            SelMaterial:null,//选中的牌号
            BatchMaterialOptions:[],//当前选中条件下的牌号列表

            CellList: [],//工段列表
            Cell:[],//传递到工段的选取值

            //数据提取条件（用户构造）
            batchTime: [new Date(Date.now() - 3600 * 1000 * 24), new Date()],//选取时间
            batchtime_s: '', //开始
            batchtime_e: '', //结束
            BatchOptions: [], //批次列表下拉选项

            selBatchID: null, //批次选择
            havaData:false,//修改了筛选条件后，是否查询了数据
            //时间空间屏蔽今日之后的时间
            pickerOptions: {
                disabledDate(date) {
                    return (
                        date.getTime() > new Date(new Date(Date.now()).toLocaleDateString()+" "+"23:59:59").getTime()
                    )
                },
            },
            fullscreenLoading:false,//加载框

        }
    },

    mounted() {
        this.BatchTimepick([dateTrans(this.batchTime[0]),dateTrans(this.batchTime[1])]);
    },

    methods: {
     

        //查询时间选取改变事件
        BatchTimepick(value) {
            this.havaData = false;
            this.batchtime_s =  value[0];
            this.batchtime_e =  value[1] ;


            if(this.selBatchID){
                //之前选中的批次不存在重新过滤出来的批次列表则取消选中
                if(this.BatchOptions.filter(x=> x.value == this.selBatchID).length==0) 
                    this.selBatchID=null;
            }
        },

        //牌号选取改变
        MatChange(matid) {
            this.havaData = false;
            if(matid){
                this.BatchOptions = getDistinctList(this.allData.filter(x=> x.MAT_ID == matid[1]), "BATCHID");
                //之前有选中的批次，如果牌号和当前选中的牌号相同则批次选中不变，否则取消批次选择
                if(this.selBatchID){
                    var selBatchIDInfo = this.BatchOptions.filter(x=>x.value == this.selBatchID);
                    if(selBatchIDInfo.length==0)
                        this.selBatchID=null;
                }
            }
            else{
                this.BatchOptions = getDistinctList(this.allData, "BATCHID");
            }
        },

        //批次选取改变
        BatchChange(batchid) {
            this.havaData = false;
            //之前有选中的牌号，如果牌号和当前选中的牌号相同则批次选中不变，否则更改选中牌号
            var selBatchIDInfo = this.allData.filter(x=>x.BATCHID == batchid);
            if(selBatchIDInfo.length > 0){
                if(selBatchIDInfo[0].MAT_ID != this.SelMaterial[1])
                    this.SelMaterial = null;
            }
        },

        //查询按钮点击事件
        SearchDocData() {
            this.fullscreenLoading=true;
            setTimeout(() => {
                //表格数据加载
    
                    this.$nextTick( ()=> {
                        this.$refs.StopRecordRef.doLayout();//】StopRecordRef】是el-table 的ref属性值
                    })
                    setTimeout(() => {
                        this.fullscreenLoading = false;
                    }, 50);
            }, 100);
        },


        //数据导出按钮点击事件
        DownLoadClick(){
            try {
                let wb = new Workbook();
                wb.SheetNames.push("断料信息"+dateTrans(this.batchTime[0]).split(' ')[0]+"_"+dateTrans(this.batchTime[1]).split(' ')[0]);

                const $e1 = this.$refs['StopRecordRef'].$el
                let $table1 = $e1.querySelector('.el-table__fixed')
                if(!$table1) {
                    $table1 = $e1
                }
                wb.Sheets["断料信息"+dateTrans(this.batchTime[0]).split(' ')[0]+"_"+dateTrans(this.batchTime[1]).split(' ')[0]] = XLSX.utils.table_to_sheet($table1,{raw:true})

                const wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST:true, type: 'array'})
                saveAs(
                    new Blob([wbout],{type: 'application/octet-stream'}),'断料信息'+dateTrans(this.batchTime[0]).split(' ')[0]+"_"+dateTrans(this.batchTime[1]).split(' ')[0]+'.xlsx',)
            } catch (e) {
                if (typeof console !== 'undefined') console.error(e)
            }  
        },
        
    }
});
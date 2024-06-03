let hsRealWeight= 0; //薄板烘丝后秤累计量
let hsOutWater= 0; //叶丝冷却水分
let gsRealWeight= 0; //掺配梗丝秤累计量
let qlsRealWeight= 0; //气流丝累计量
let qlsRealOutWater= 0; //气流丝水分
let gsOutWater= 0; //梗丝水分
let jxOutWater= 0; //加香入口秤累计量
let jxRealWeight = 0;//加香实际重量

let BomPlan = 0;//bom加香产量
let jxTheoryWeight = 0;//加香理论重量
let ejTheoryWeight = 0;//二加理论重量
let hsTheoryWeight = 0;//烘丝理论重量

var prodDataOutput = new Vue({ //树的VUE对象
    el: "#prodDataOutput",
    data() {
        return {
            TableIndex:0,
            //数据提取条件（用户构造）
            batchTime: [],//选取时间
            batchtime_s: '', //开始
            batchtime_e: '', //结束
            MatOptions: [],//牌号可选
            BatchOptions: [], //批次列表下拉选项
            allData:[],//只靠时间过滤出来的所有数据
            selBatchID: null, //批次选择
            selMatID: [], //牌号选择
            SelMoelID:null,
            ModelOptions:$.Enumerable.From(loaddata("HISDOCOUTPUTMODEL",[{"cn":"FORWHAT","cp":"=","v1":"KeyData","v2":null}]).d).OrderBy('$.APPROVALDATE').ToArray(),
            FixQuareDatas:[], //表格头固定数据
            ParaQuareDatas:[], //表格参数数据
            descriDialogVisible:false,//编辑框是否可见
            nowDesc:"",//选中节点的描述
            nowDescRow:null,//当前修改描述的行
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

            ShiftOptions:$.Enumerable.From(RequestHd(GetorDelData("mdb\\get", "APP_CONFIG_ITEMS", [{ "cn": "PARENTCFG", "cp": "=", "v1": "+SYSBC", "v2": null }])).d).OrderBy("$.CFG_ID").ToArray(),//牌号列表
            selShiftID:null,//选中的班次
        }
    },

    mounted() {
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1);
        const start = new Date(new Date().getTime()-24*60*60*1000);
        var year = start.getFullYear();
        var month = start.getMonth();
        var date=  start.getDate() ;
        this.batchTime = [new Date(year, month, date), end];
        this.batchtime_s = dateTrans(this.batchTime[0]);
        this.batchtime_e = dateTrans(this.batchTime[1]);

        this.batchTimepick(this.batchTime);
        this.SelMoelID = this.ModelOptions.length>0?this.ModelOptions[0].MODELCODE:null;
    },

    methods: {
        //按时间卡的批次任务对应的牌号树
        getBatchMaterialOptions(arr) {
            //获取最上层数据
            let parent = $.Enumerable.From(loaddata("MAT_CLASS", [{ "cn": "PARENTCLASS", "cp": "is not", "v1": null, "v2": null }]).d).OrderBy("$.CLASSSORTNUM").ToArray();
            parent = parent.filter((x)=>arr.some((item)=>x.MAT_CLASS_ID===item.MAT_CLASS_ID));

            this.MatOptions = []; //第一级
            parent.forEach(item => {
                let obj = {};
                obj.value = item.MAT_CLASS_ID;
                obj.label = item.MAT_CLASSNAME;
                let children = [];
                let detailMat = $.Enumerable.From(arr.filter(x=>x.MAT_CLASS_ID === item.MAT_CLASS_ID)).OrderBy("$.SORTNUM").ToArray();
                detailMat = getDistinctList(detailMat, "MAT_ID","MAT_NAME");
                detailMat.forEach(el=>{
                    children.push({value:el.value,label:el.text});
                });
                obj.children = children;
                this.MatOptions.push(obj);
            });
        },
        filterRefresh(){
            this.allData = $.Enumerable.From(this.allData).OrderBy("$.BATCHID").ToArray();
            var temp = this.allData;
            if(this.selMatID && this.selMatID.length>0){
                var temp =temp.filter(x=>(x.MAT_ID == this.selMatID[1]));
            }
            if(this.selShiftID){
                var temp =temp.filter(x=>x.EXESHIFT1==this.selShiftID);
            }
            this.BatchOptions = getDistinctList(temp, "BATCHID","BATCHID");
            this.BatchOptions = $.Enumerable.From(this.BatchOptions).OrderBy("$.BATCHID").ToArray();
            if(this.selBatchID && this.BatchOptions.filter(x=>x.BATCHID == this.selBatchID).length == 0)
                this.selBatchID = null;
            // if(this.selShiftID && temp.filter(x=>x.EXESHIFT1==this.selShiftID).length == 0)
            //     this.selShiftID = null;
        },
        //时间选取改变
        batchTimepick(value) {
            this.batchTime = value;
            this.havaData = false;
            this.MatOptions = [];
            this.batchtime_s = dateTrans(value[0]);
            this.batchtime_e = dateTrans(value[1]);
            this.allData = loaddata("v_keydata", [{ "cn": "BATCHSTARTTIME", "cp": "between", "v1": "datetime("+this.batchtime_s+")", "v2": "datetime("+this.batchtime_e+")" }]).d;

            this.getBatchMaterialOptions(this.allData);
            this.filterRefresh();
        },
        //批次号修改
        // batchChange(){
        //     this.filterRefresh();
        // },
        //牌号修改
        matChange(){
            this.filterRefresh();
        },
        //班次修改
        shiftChange(){
            this.filterRefresh();
        },

        //开始查询数据
        SearchDocData() {
            this.fullscreenLoading=true;
            this.TableIndex = this.TableIndex+1;
            setTimeout(() => {
                this.FixQuareDatas = [];
                this.ParaQuareDatas =[];
                let str ="select max(t.cnt) cnt from (select d.batchid,count(d.propertyid) cnt from v_keydata d where (d.BATCHSTARTTIME between to_date('"
                +this.batchtime_s+"','yyyy-mm-dd hh24:mi:ss') and to_date('"+this.batchtime_e+"','yyyy-mm-dd hh24:mi:ss')) ";
                
                let paras = [{ "cn": "BATCHSTARTTIME", "cp": "between", "v1": "datetime("+this.batchtime_s+")", "v2": "datetime("+this.batchtime_e +")"},{ "cn": "MODELCODE", "cp": "=", "v1": this.SelMoelID, "v2": null }];
                if(this.selMatID && this.selMatID.length>0){
                    paras.push({ "cn": "MAT_ID", "cp": "=", "v1": this.selMatID[1], "v2": null });
                    str+=" and d.MAT_ID='"+this.selMatID[1]+"' "
                }
                if(this.selBatchID){
                    paras.push({ "cn": "BATCHID", "cp": "=", "v1": this.selBatchID, "v2": null });
                    str+=" and d.BATCHID='"+this.selBatchID+"' "
                }
    
                str +="group by d.batchid) t";
                var originalData= $.Enumerable.From(loaddata("v_keydata",paras).d).OrderBy("$.DOCTIME").ToArray();
                if(originalData.length>0){
                    //过滤批次
                    originalData = originalData.filter((x)=>this.BatchOptions.some((item)=>x.BATCHID===item.value));
                    let maxParaNum = selfSql_One(str);
                    if(maxParaNum.s === 0){
                        //表头横向数据最大长度
                        let num = maxParaNum.d[0].CNT;

                        //数据展现形式是横向的，需要将行数据打包成分组
                        let getGroup=(data,key)=>{
                            let groups={};
                            data.forEach(c=>{
                                let value=c[key];
                                groups[value]=groups[value]||[];
                                groups[value].push(c);
                            });
                            return groups;
                        }
                        let GroupData = JSON.parse(JSON.stringify(getGroup(originalData,'BATCHID')));
    
                        //所有的批次
                        let batchList = getDistinctList(originalData, "BATCHID");
    
                        //先存一个最长的头用于遍历
                        let addindex = 0;
                        try{
                            batchList.forEach(item=>{
                                if(GroupData[item.value].length === num){
                                    let temp = $.Enumerable.From(GroupData[item.value]).OrderBy("$.PROPERTYID").ToArray();
                                    let paraData =new Object();
                                    //加入bom两个值
                                    /*定制程序1 */
                                    paraData["PARANAME"]="理论投料量(叶组烟丝配方量)";
                                    paraData["PARA"]='PARA0';
                                    this.ParaQuareDatas.push(paraData);

                                    paraData =new Object();
                                    paraData["PARANAME"]="烟丝配方标准合计数";
                                    paraData["PARA"]='PARA1';
                                    this.ParaQuareDatas.push(paraData);
                                    /*定制程序1 */

                                    addindex=2;
                                    temp.forEach((element,j)=>{
                                        paraData =new Object();
                                        paraData["PARANAME"]=element.PARAFLAG;
                                        paraData["PARA"]='PARA'+parseInt(j+addindex);
                                        this.ParaQuareDatas.push(paraData);

                                        /*定制程序2 */
                                        if(element.PARAFLAG == "松散回潮出口水分"){
                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="二级加料入口理论重量";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);

                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="二级加料前损耗";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);
                                        }
                                        else if(element.PARAFLAG == "叶丝冷却水分"){
                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="烘丝出口理论重量";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);
                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="烘丝后损耗";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);
                                        }
                                        if(j == num -1){
                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="加香出口理论重量";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);
                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="加香前损耗";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);
                                            addindex+=1;
                                            paraData =new Object();
                                            paraData["PARANAME"]="出丝率";
                                            paraData["PARA"]='PARA'+parseInt(j+addindex);
                                            this.ParaQuareDatas.push(paraData);
                                        }
                                        /*定制程序2 */
                                    });
                                    throw Error();
                                }
                            });
                        }catch{}
    
                        batchList.forEach((item,i)=>{
                            hsRealWeight= 0; //薄板烘丝后秤累计量
                            hsOutWater= 0; //叶丝冷却水分
                            gsRealWeight= 0; //掺配梗丝秤累计量
                            qlsRealWeight= 0; //气流丝累计量
                            qlsRealOutWater= 0; //气流丝水分
                            gsOutWater= 0; //梗丝水分
                            jxOutWater= 0; //加香入口秤累计量
                            jxRealWeight = 0;//加香实际重量
                            
                            BomPlan = 0;//bom加香产量
                            jxTheoryWeight = 0;//加香理论重量
                            ejTheoryWeight = 0;//二加理论重量
                            hsTheoryWeight = 0;//烘丝理论重量

                            this.FixQuareDatas.push({INDEX:i+1,BATCHID:item.value,MAT_NAME:GroupData[item.value][0].MAT_NAME,STARTTIME:GroupData[item.value][0].BATCHSTARTTIME,DESCRIPTION:GroupData[item.value][0].PRODOCDESC});
                            /*定制程序3 */
                            let firstWeight =0;//投料（薄片+模组1）
                            /*定制程序3 */

                            this.ParaQuareDatas.forEach((p,j)=>{
                                //叶组投料量
                                /*定制程序4 */
                                if(j==0){
                                    let WeightIn = $.Enumerable.From(loaddata("V_KEYDATA_BOMWEIGHT",[{ "cn": "MAT_ID", "cp": "=", "v1":GroupData[item.value][0].MAT_ID , "v2": null}]).d).ToArray();
                                    if(WeightIn.length>0){
                                        this.FixQuareDatas[i]['PARA'+j] = WeightIn[0].BOMWEIGHT;
                                        firstWeight = WeightIn[0].BOMWEIGHT;
                                    }
                                    else{
                                        this.FixQuareDatas[i]['PARA'+j] = null;
                                    }
                                }
                                //烟丝产量
                                else if(j==1){
                                    let WeightOut = $.Enumerable.From(loaddata("MAT_BOM",[{ "cn": "BOM_TYPE", "cp": "=", "v1":2, "v2": null},{ "cn": "MAT_ID", "cp": "=", "v1":GroupData[item.value][0].MAT_ID , "v2": null}]).d).OrderByDescending('$.VALIDDATE').ToArray();
                                    if(WeightOut.length>0){
                                        this.FixQuareDatas[i]['PARA'+j] = WeightOut[0].LATS_WEIGHT;
                                    }
                                    else{
                                        this.FixQuareDatas[i]['PARA'+j] = 0;
                                    }
                                    BomPlan = this.FixQuareDatas[i]['PARA'+j];
                                }
                                else{
                                    if(p.PARANAME == "二级加料入口理论重量"){
                                        let ParaIndex = 1;
                                        let TheoryDocWeight = $.Enumerable.From(loaddata("V_KEYDATA_CALDOC",[{ "cn": "BATCHID", "cp": "=", "v1":item.value, "v2": null},{ "cn": "PARAINDEX", "cp": "=", "v1":ParaIndex , "v2": null}]).d).OrderByDescending('$.VALIDDATE').ToArray();
                                        if(TheoryDocWeight.length>0 && firstWeight !=null && TheoryDocWeight[0].OUTWATER != null){
                                            this.FixQuareDatas[i]['PARA'+j] = (firstWeight*88/(100-TheoryDocWeight[0].OUTWATER)).toFixed(2);
                                        }
                                        else{
                                            this.FixQuareDatas[i]['PARA'+j] = null;
                                        }
                                        ejTheoryWeight =this.FixQuareDatas[i]['PARA'+j];//二加理论产量
                                    }
                                    else if(p.PARANAME == "烘丝出口理论重量"){
                                        let ParaIndex = 2;
                                        let TheoryDocWeight = $.Enumerable.From(loaddata("V_KEYDATA_CALDOC",[{ "cn": "BATCHID", "cp": "=", "v1":item.value, "v2": null},{ "cn": "PARAINDEX", "cp": "=", "v1":ParaIndex , "v2": null}]).d).OrderByDescending('$.VALIDDATE').ToArray();
                                        if(TheoryDocWeight.length>0 && TheoryDocWeight[0].ALLWEIGHT && TheoryDocWeight[0].OUTWATER != null){
                                            this.FixQuareDatas[i]['PARA'+j] = (TheoryDocWeight[0].ALLWEIGHT*(100-TheoryDocWeight[0].INWATER)/(100-TheoryDocWeight[0].OUTWATER)).toFixed(2);
                                        }
                                        else{
                                            this.FixQuareDatas[i]['PARA'+j] = null;
                                        }

                                        hsTheoryWeight =this.FixQuareDatas[i]['PARA'+j];//烘丝理论产量
                                    }
                                    else if(p.PARANAME == "二级加料前损耗"){
                                        let realWeight = $.Enumerable.From(loaddata("V_KEYDATA_DOC",[{ "cn": "PARAFLAG", "cp": "=", "v1":"二级加料入口秤物料累计量", "v2": null},
                                        { "cn": "BATCHID", "cp": "=", "v1":item.value , "v2": null}]).d).ToArray();
                                        if(realWeight.length>0 && ejTheoryWeight != null && realWeight[0].PROPERTYVALUE !=null){
                                            this.FixQuareDatas[i]['PARA'+j] = (parseFloat((ejTheoryWeight - realWeight[0].PROPERTYVALUE))).toFixed(2);
                                        }
                                        else{
                                            this.FixQuareDatas[i]['PARA'+j] = null;
                                        }
                                    }
                                    else if(p.PARANAME == "烘丝后损耗"){
                                        if(hsTheoryWeight != null && hsRealWeight){
                                            this.FixQuareDatas[i]['PARA'+j] = (hsTheoryWeight - hsRealWeight).toFixed(2);
                                        }
                                        else{
                                            this.FixQuareDatas[i]['PARA'+j] = null;
                                        }
                                    }
                                    else if(p.PARANAME == "加香出口理论重量"){
                                        if(jxOutWater != 100){
                                            var fenzi = 0;
                                            var hs = hsRealWeight*(100-hsOutWater);
                                            var qls =qlsRealWeight*(100-qlsRealOutWater);
                                            var gs = gsRealWeight*(100-gsOutWater);
                                            if(hsRealWeight)
                                                fenzi = fenzi +hs;
                                            if(qlsRealWeight)
                                                fenzi = fenzi +qls;
                                            if(gsRealWeight)
                                                fenzi = fenzi +gs;
                                            this.FixQuareDatas[i]['PARA'+j] = (fenzi/(100-jxOutWater)).toFixed(2);
                                            jxTheoryWeight = this.FixQuareDatas[i]['PARA'+j];
                                        }
                                        else{
                                            this.FixQuareDatas[i]['PARA'+j] = null;
                                        } 
                                    }
                                    else if(p.PARANAME == "加香前损耗"){
                                        this.FixQuareDatas[i]['PARA'+j] = (jxTheoryWeight-jxRealWeight).toFixed(2);
                                    }
                                    else if(p.PARANAME == "出丝率"){
                                        this.FixQuareDatas[i]['PARA'+j] = BomPlan == 0 ?null:((jxRealWeight/BomPlan)*100).toFixed(2)+'%';
                                    }
                                    else{
                                        /*定制程序4 */
                                        //遍历最大的表格头，批次分组下不存在对应信息点的值则置为null
                                        let temp = GroupData[item.value].filter(a=>a.PARAFLAG == p.PARANAME);
                                        if(temp.length>0){
                                            this.FixQuareDatas[i]['PARA'+j] = temp[0].PROPERTYVALUE;
                                        }
                                        else{
                                            this.FixQuareDatas[i]['PARA'+j] = null;
                                        }

                                    }
                                }

                                //存储计算加香出口理论重量所用的参数[列名称，列值]
                                this.FragTheoryRel(p.PARANAME,this.FixQuareDatas[i]['PARA'+j]);
                            });
                        });
                    }
                }
                else{
                    this.$message({
                        showClose: true,
                        type: 'warning',
                        message: "选中条件下暂无数据！"
                    });
                }
                this.havaData = true;
                this.$nextTick( ()=> {
                    this.$refs.keyData.doLayout(); 
                })
                setTimeout(() => {
                    this.fullscreenLoading = false;
                }, 50);
            }, 100);
        },

        //计算加香出口理论重量所用的参数
        FragTheoryRel(col,value){
            let temp =value == null?0:value;
            if(col == "薄板烘丝后秤累计量")
                hsRealWeight = temp;
            else if(col == "叶丝冷却水分")
                hsOutWater = temp;
            else if(col == "气流丝累计量")
                qlsRealWeight = temp;
            else if(col == "气流丝水分")
                qlsRealOutWater = temp;
            else if(col == "掺配梗丝秤累计量")
                gsRealWeight = temp;
            else if(col == "梗丝水分")
                gsOutWater = temp;
            else if(col == "加香出口水分")
                jxOutWater = temp;
            else if(col == "加香入口秤累计量")
                jxRealWeight = temp;
        },
        //打开备注编辑框
        editDescription(index,row){
            this.descriDialogVisible = true;
            this.nowDesc = row.DESCRIPTION;
            this.nowDescRow = row;
            //消除点击选择按钮对行的操作
            this.$refs.docData.toggleRowSelection(row);
        },

        //保存编辑框数据
        saveDescription(){
            var updateRequest = saveData("PRD_BATCH",{PRODOCDESC:this.nowDesc}, [{ "cn": "BATCHID", "cp": "=", "v1":this.nowDescRow.BATCHID, "v2": null }]);
            var saveBatchDocDesc = RequestHd(updateRequest);
            if(saveBatchDocDesc.s===0){
                this.FixQuareDatas[this.nowDescRow.INDEX].DESCRIPTION = this.nowDesc;
                this.descriDialogVisible = false;
            }
        },

        //转换成Json
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },

        //下载数据
        downLoadClick(){
            if(!this.havaData)
                this.SearchDocData();

            var hisData = [];//历史数据
            var vtHead=[];
            var cols=[];
            var data=[];

			this.ParaQuareDatas.forEach((item, index) => {
                if(index==0){
                    vtHead.push("序号");
                    cols.push(cols.length);
                    vtHead.push("批次号");
                    cols.push(cols.length);
                    vtHead.push("牌号");
                    cols.push(cols.length);
                    vtHead.push("批次开始时间");
                    cols.push(cols.length);
                }
                vtHead.push(item.PARANAME);
                cols.push(cols.length);
                if(index == this.ParaQuareDatas.length -1)
                vtHead.push("备注");
                cols.push(cols.length);
			});
            this.FixQuareDatas.forEach((batch,j)=>{
                var temp=[];
                temp.push(batch.INDEX);
                temp.push(batch.BATCHID);
                temp.push(batch.MAT_NAME);
                temp.push(batch.STARTTIME);
                this.ParaQuareDatas.forEach((para,k)=>{
                    temp.push(batch[para.PARA]);
                });
                temp.push(batch.DESCRIPTION);
                data.push(temp);
            });

            var body = this.formatJson(cols, data);
            var obj = {
                th: vtHead,//表头
                data: body,//数据
                sheetTitle: "产耗数据" //工作簿名
            }
            hisData.push(obj);
			exprotex(hisData,"产耗数据" + this.batchTime[0]+"_"+this.batchTime[1]);   
        }
    }
});
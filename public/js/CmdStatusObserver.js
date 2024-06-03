var CellObserver = new Vue({
    el:"#CellObserver",
    data(){
        return{
            expandTreeData:[],//默认展开
            showtreedata:[],
            showtreeprops: { //treedata 参数定义
                children: 'children', //定义treedata中子节点的对象名
                label: 'nlabel' //定义treedata中用于标注节点的名称的key
            },
            selnode:null,
            showtabledata:[],
            showcmd:{},
            rules:{
                CMDSCHEDSTATUS:[
                    { required: true, message: '请输入模板名称', trigger: ['blur'] },
                ],
            },
            statuspropfilters:[],
            dialogVisible:false,
            nowstatus:null,
        }
    },
    mounted() {
        this.initTree();
        this.getStatusType();
    },
    methods: {
        //初始化树
        initTree(){
            this.expandTreeData = [];
            var temp = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", []).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
            if (temp.length>0) {
                for(let x = 0;x<temp.length;x++){
                    if(temp[x].CONTAINEDIN == null){
                        temp[x].nid = temp[x].EQUIPMENTID;
                        temp[x].nlabel = temp[x].EQUIPMENTNAME;
                        getchildnode(temp, temp[x].EQUIPMENTID,temp[x],"CONTAINEDIN","EQUIPMENTID","EQUIPMENTNAME");
                        this.expandTreeData.push(temp[x].EQUIPMENTID);
                        temp[x].children = $.Enumerable.From(temp[x].children).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
                        temp[x].children.forEach(element=>{
                            this.expandTreeData.push(element.nid);
                        });
                        this.$nextTick(function () {
                            this.showtreedata.push(JSON.parse(JSON.stringify(temp[x])));
                        });
                    }
                }
            }
        },
        showtreeclick(data, node, nodeobj){
            this.showtabledata = [];
            this.selnode = JSON.parse(JSON.stringify(data));
            if(this.selnode.children.length == 0){//叶子结点
                var cons = [
                    {"cn":"UNITID","cp":"=","v1":this.selnode.EQUIPMENTID,"v2":null},
                    {"cn":"CMDSCHEDSTATUS","cp":"=","v1":2,"v2":null},
                ]
                var temp = $.Enumerable.From(loaddata("V_PRDPLAN", cons).d).OrderBy("$.BATCHID").ToArray();
                this.showtabledata = temp
            }
        },
        showtableRowClick(value){
            this.showcmd = JSON.parse(JSON.stringify(value));
            this.nowstatus = this.showcmd.CMDSCHEDSTATUS;

        },
        getStatusType(){
            var temp = $.Enumerable.From(loaddata("BXT_ENUMERATION",[{"cn": "ENUMSET", "cp": "=", "v1": "ScheduleStatus", "v2": null}]).d).ToArray();
            temp.forEach(element => {
                this.statuspropfilters.push({text:element.ENUMSTRING,value:element.ENUMVALUE});
            });
        },
        //保存信息
        btnsure(){
            var temp = {
                // TASKID:this.showcmd.TASKID,
                // CMDID:this.showcmd.CMDID,
                // UNITID:this.showcmd.UNITID,
                TRIGGERSTATUS:this.showcmd.CMDSCHEDSTATUS,
                // SCHEDSTARTTIME:"datetime("+this.showcmd.CMDSCHEDSTARTTIME+")",
                // SCHEDENDTIME:"datetime("+this.showcmd.CMDSCHEDENDTIME+")",
                // EXESTARTTIME:"datetime("+this.showcmd.CMDEXESTARTTIME+")",
                // EXEENDTIME:"datetime("+this.showcmd.CMDEXEENDTIME+")",
                // EXECUTOR:null,
                // EXESHIFT1:this.showcmd.CMDEXESHIFT1,
                // EXESHIFT2:this.showcmd.CMDEXESHIFT2,
                AUTHOR:top.LogInfor.UserName,
                // CREATEDATE:null,
                // PRIORITY:null,
                // DESCRIPTION:null,
                // EXEPRIORITY:null,
                // TRIGGERSTATUS:null
            };
            var bkmessage = saveData("PRD_UNITCMD",temp, [
                { "cn": "TASKID", "cp": "=", "v1": this.showcmd.TASKID, "v2": null },
                { "cn": "CMDID", "cp": "=", "v1": this.showcmd.CMDID, "v2": null }
            ]);
            var saveresult = RequestHd(bkmessage);
            if(saveresult.s == 0){
                this.$message({
                    type: 'success',
                    message: "成功修改批次【"+ this.showcmd.BATCHID +"】中工序【"+ this.showcmd.UNITNAME +"】的状态！"
                });
                addUserOperLog( "在【生产单元批次监视】页面中【修改】了批次【"+ this.showcmd.BATCHID +"】的工序【"+ this.showcmd.UNITNAME +"】状态，从【"+ this.statuspropfilters[this.nowstatus].text +"】改为【"+ this.statuspropfilters[this.showcmd.CMDSCHEDSTATUS].text +"】",top.LogInfor.UserName,top.LogInfor.clientip);
                var temp1 = [];
                this.showtabledata.forEach(item => {
                    if(item.TASKID != this.showcmd.TASKID && item.CMDID != this.showcmd.CMDID){
                        temp1.push(item);
                    }
                })
                this.showtabledata = JSON.parse(JSON.stringify(temp1));
                this.nowstatus = null;
                this.showcmd = {};
            }else{
                this.$message({
                    type: 'error',
                    message: '修改失败 ！'
                });
            }
            this.dialogVisible = false;
        }
    },
})
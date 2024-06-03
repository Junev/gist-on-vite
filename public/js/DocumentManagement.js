var maxFileSize = 20.48; //最大的文档上传大小 20M
var docPath = "docfiles/app" + getUrlParam("appid") + '/m' + getUrlParam("modelid");


$(document).ready(function () {
    GroupDocuments.nodes = GetTreeNode(null, 0); //初始化文档目录树
});

var GroupDocuments = new Vue({
    el: "#GroupDocuments",
    data: {
        selgroupid: null, //选中目录ID
        selgroupdoc: null, //选中目录下的文档数据
        selgroup: null, //选中目录数据
        seldoc: null, //选中文档数据
        fun: getUrlParam("fun") == "M" ? "M" : "Q", //权限（可操作和仅下载）

        treeprops: {
            children: 'children', //treedata中子节点的对象名
            label: 'label' //treedata中用于label显示的项
        },
        nodes: [], //构造文档目录树
        selnode: null, //选中节点对象，在treenodeclick事件中进行构造
    },
    methods: {
        //点击树节点
        treenodeclick(data, node) { //选中文档目录树节点
            this.selnode = data;
            this.selgroupid = data.id;
            this.selgroup = data.nodeobj;
            this.seldoc = null;
        },
        //上传文档
        UploadDoc: function () {
            var f = document.getElementById('uploaddocctl');
            //先验证文件大小
            if (f.files[0].size / (1024 * 1024) > maxFileSize) {
                f.value = '';
                this.$message.error('文件太大，不能上传超过 ' + maxFileSize + 'M 的文档！');
                return;
            }
            if (f.value != null && f.value != '') {
                try {
                    var tempdate = new Date();
                    var RUID = tempdate.getFullYear().toString().substring(2, 4) + AppendZero(tempdate.getMonth() + 1) + AppendZero(tempdate.getDate()) + AppendZero(tempdate.getHours()) + AppendZero(tempdate.getMinutes()) + AppendZero(tempdate.getSeconds()) + AppendZero(tempdate.getMilliseconds());
                    var key = this.selgroupid + RUID;
                    var filename = this.selgroupid + RUID + f.value.substring(f.value.lastIndexOf('.')); //服务器存储的文件名：key.文件扩展名(不能为中文）
                    var em = UploadFile(docPath, filename, f.files[0]); //上传文件到指定路径
                    if (em == '') //上传成功
                    {
                        var newdoc = {
                            APPID: getUrlParam("appid"),
                            APPMODELID: getUrlParam("modelid"),
                            AUTHOR: top.LogInfor.UserName,
                            CREATEDATE: "datetime" + "(" + newdate() + ")",
                            DESCRIPTION: null,
                            DOCUMENTID: key,
                            PARENTGROUPID: this.selgroupid,
                            FILENAME: docPath + '/' + "@@" + filename + "@@" + f.files[0].name
                        };
                        var adds = addMDBData("DOC_DOCUMENT", newdoc);
                        if (adds === 0) {
                            addUserOperLog("在【文档资料信息管理】页面,在【" + this.selnode.label + "】文档目录下【上传】了新的文档【" + f.files[0].name + "】", top.LogInfor.UserName, top.LogInfor.clientip);
                            this.selgroupdoc.push(newdoc); //在界面绑定对象中加入node
                            this.$forceUpdate(); //vue对象强制更新
                            document.getElementById('uploaddocctl').value = null; //隐藏文件上传控件中的值初始化（防止若用户上传同名文件不触发UploadDoc事件）
                            this.$message({
                                message: "上传成功!",
                                type: 'success'
                            })
                            return
                        } else {
                            this.$message({
                                message: "操作发生错误!",
                                type: 'error'
                            })
                            return
                        }
                    }
                    this.$message({
                        message: "上传文件失败，请检查所选文件!",
                        type: 'error'
                    })
                    return
                } catch (error) {
                    this.$message({
                        message: error.message,
                        type: 'error'
                    })
                    return
                }
            }
        },
        //下载文档
        DownLoadDoc: function () {
            var docx = this.seldoc ? this.seldoc.FILENAME : null;
            if (docx && docx.indexOf('@@') >= 0) {
                DownLoadFile(docx.substring(0, docx.lastIndexOf('@@')).replace('@@', ''), docx.substring(docx.lastIndexOf('@@') >= 0 ? docx.lastIndexOf('@@') + 2 : 0));
            }
        },
        //删除文档
        RemoveDoc: function () {
            if (!this.seldoc || !this.seldoc.DOCUMENTID) {
                this.$message({
                    message: "请选择文档!",
                    type: "error"
                })
                return;
            } else {
                this.$confirm('确定【移除】该文档吗？', '确认操作', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    var _cons = [{
                        "cn": "DOCUMENTID",
                        "cp": "=",
                        "v1": this.seldoc.DOCUMENTID,
                        "v2": null
                    }];
                    var ret = GetorDelData("mdb\\del", "DOC_DOCUMENT", _cons);
                    var retresult = RequestHd(ret);
                    var tempfilename = this.seldoc.FILENAME.substring(0, this.seldoc.FILENAME.lastIndexOf('@@')).replace('@@', '/');
                    var removepost = removeDBfile(tempfilename); 

                    var tempdelflag = retresult.d ? true : false;
                    if (tempdelflag) {
                        if (retresult.s === 0 && removepost === 0 ) {
                            addUserOperLog("在【文档资料信息管理】页面,在【" + this.selnode.label + "】文档目录下【移除】了文档【" + this.seldoc.FILENAME.substring(this.seldoc.FILENAME.lastIndexOf('@@')).replace('@@', '') + "】", top.LogInfor.UserName, top.LogInfor.clientip);
                            this.selgroupdoc.splice($.inArray(this.seldoc, this.selgroupdoc), 1); //删除树节点
                            this.seldoc = null; //初始化选中文档数据
                            this.$message({
                                message: "移除成功！",
                                type: "success"
                            })
                        } else {
                            this.$message({
                                message: retresult.m,
                                type: "error"
                            })
                            return;
                        }
                    } else {
                        this.$message({
                            message: "无法获取服务！",
                            type: "error"
                        })
                        return;
                    }
                }).catch(() => {
                    this.$message({
                        message: "已取消删除！",
                        type: "warning"
                    })
                    return;
                })
            }
        },
        //点击文档
        selectDoc: function (D) {
            this.seldoc = D;
        },
        //根据文档类型设置图标
        setTypeClass: function (fileName) {
            var type = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
            var DocReg = /^[Dd][Oo][Cc]|[Dd][Oo][Cc][Xx]$/;
            var pdfReg = /^[Pp][Dd][Ff]$/;
            var TxtReg = /^[Tt][Xx][Tt]$/;
            var XlsReg = /^[Xx][Ll][Ss]|[Xx][Ll][Ss][Xx]$/;
            var RarReg = /^[Rr][Aa][Rr]|[Zz][Ii][Pp]$/;
            var PptReg = /^[Pp][Pp][Tt]|[Pp][Pp][Tt][Xx]$/;
            if (DocReg.test(type)) {
                return "fa fa-file-word-o";
            } else if (pdfReg.test(type)) {
                return "fa fa-file-pdf-o";
            } else if (TxtReg.test(type)) {
                return "fa fa-file-text-o";
            } else if (XlsReg.test(type)) {
                return "fa fa-file-excel-o";
            } else if (RarReg.test(type)) {
                return "fa fa-file-zip-o";
            } else if (PptReg.test(type)) {
                return "fa fa-file-powerpoint-o";
            } else {
                return "fa fa-file-o";
            }
        }
    },
    watch: {
        selgroupid: function () { //selgroupid变化时触发执行本事件（watch的用法）
            var _cons = [{
                "cn": "APPID",
                "cp": "=",
                "v1": getUrlParam("appid"),
                "v2": null
            }, {
                "cn": "APPMODELID",
                "cp": "=",
                "v1": getUrlParam("modelid"),
                "v2": null
            }, {
                "cn": "PARENTGROUPID",
                "cp": "=",
                "v1": this.selgroupid,
                "v2": null
            }];
            var tempselgroupdoc = loaddata("DOC_DOCUMENT", _cons);
            var tempflag = tempselgroupdoc.d ? true : false;
            if (tempflag) {
                this.selgroupdoc = $.Enumerable.From(tempselgroupdoc.d).OrderBy("$.DOCUMENTID").ToArray();
            } else {
                this.selgroupdoc = null;
            }

        },
    },
    filters: {
        FileTitle: function (filesavename) {
            if (!filesavename)
                return '';
            try {
                return !filesavename ? '' : (filesavename.substring(filesavename.lastIndexOf('@@') >= 0 ? filesavename.lastIndexOf('@@') + 2 : 0))
            } catch (e) {
                return '';
            }
        }
    }
});

//递归方法，构造文档目录树
function GetTreeNode(parentID, iLevel) {
    var nodes = [];
    var _cons = [{
        "cn": "APPID",
        "cp": "=",
        "v1": getUrlParam("appid"),
        "v2": null
    }, {
        "cn": "APPMODELID",
        "cp": "=",
        "v1": getUrlParam("modelid"),
        "v2": null
    }, {
        "cn": "PARENTGROUPID",
        "cp": (parentID == null) ? "is" : "=",
        "v1": parentID,
        "v2": null
    }];
    var getdocgroup = loaddata("DOC_GROUP", _cons);
    var tempfal = getdocgroup.d ? true : false;
    var nodeDataList = [];
    if (tempfal) {
        nodeDataList = $.Enumerable.From(getdocgroup.d).OrderBy("$.DOCGROUPID").ToArray();
    }
    $.each(nodeDataList, function (i, nodedata) { //遍历父目录数组得到子节点数组
        var node = {
            id: nodedata.DOCGROUPID,
            label: nodedata.DOCGROUPNAME,
            parentid: nodedata.PARENTGROUPID,
            level: iLevel,
            isleaf: false,
            initcollapsed: true,
            enable: true,
            checkbox: false,
            checkable: false,
            selected: false,
            children: [],
            nodeobj: nodedata,
            nodeicon: (iLevel % 2 == 0) ? 'iconpr iconfont icon-yewudanyuan' : 'iconfont icon-luxianyunshuliuliangtongji iconpr'

        };
        node.children = GetTreeNode(nodedata.DOCGROUPID, iLevel + 1); //获取再下一层节点数组
        node.isleaf = (node.children.length == 0) ? true : false; //是否为叶子节点，初始全为false，若node中的children数组长度为零则标记true
        nodes.push(node);
    });
    return nodes;
}
//2022 04 22 时间自动补零
function AppendZero(para) {
    if (para < 10) {
        return "0" + para;
    } else {
        return para;
    }
}
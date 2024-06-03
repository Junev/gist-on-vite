$(document).ready(function () {
	DocGroupForm.nodes = GetTreeNode(null, 0); //初始化文档目录树
});
var DocGroupForm = new Vue({ //Form的VUE对象
	el: "#DocGroupForm",
	data() {
		var validategroupID = (rule, value, callback) => {
			if (value === "" || !value) {
				callback(new Error("请输入资料目录编码！"));
			} else if (value) {
				for (var i = 0; i < this.AllGroupID.length; i++) {
					if (value === this.AllGroupID[i] && this.AddData) {
						callback(new Error("该资料目录编码已存在，请输入其他编码!"));
					}
				}
				callback();
			} else if (!this.AddData) {
				callback();
			}
		}
		return {
			AddData: false, //添加/删除标记
			Doc_Group: {}, //DocGroupForm对象，来自选中节点，在树选中事件中构造
			isRootUndefined: false,
			AllGroupID: [], //目前已经拥有的资料目录编码
			selnode: null, //选中节点对象，在treenodeclick事件中进行构造
			nodes: [], //文档目录树对象
			rules: {
				DOCGROUPID: [{
					required: true,
					validator: validategroupID,
					trigger: 'blur'
				}],
			},
			treeprops: {
				children: 'children', //treedata中子节点的对象名
				label: 'label' //treedata中用于label显示的项
			},
		}

	},
	created() {
		this.isRootUndefined = this.getdoc_group(getUrlParam("appid"), getUrlParam("modelid"));
	},
	methods: {
		//点击树节点
		treenodeclick(data, node) {
			this.selnode = data;
			this.Doc_Group = (data == undefined) ? {} : JSON.parse(JSON.stringify(data.nodeobj)); //先将对象转换为jon字符串再反序列化出一个新的对象，将引用对象转为值对象
			this.AddData = false;
			this.$nextTick(() => {
				this.$refs['Doc_Group'].clearValidate();
			});
		},
		//2024 04 28
		getdoc_group(appid, appmodelid) {
			if (appid && appmodelid) {
				var _cons = [{
					"cn": "APPID",
					"cp": "=",
					"v1": appid,
					"v2": null
				}, {
					"cn": "APPMODELID",
					"cp": "=",
					"v1": appmodelid,
					"v2": null
				}];
				var getdocdata = loaddata("DOC_GROUP", _cons);
				var tempfal = getdocdata.d ? true : false;
				if (tempfal) {
					if (getdocdata.d.length > 0) {
						var temparr = $.Enumerable.From(getdocdata.d).OrderBy("$.DOCGROUPID").ToArray();
						var tempdata = [];
						temparr.forEach(element => {
							if (element.DOCGROUPID) {
								tempdata.push(element.DOCGROUPID)
							}
						});
						this.AllGroupID = $.Enumerable.From(tempdata).ToArray();
						return true;
					} else {
						return false
					}
				} else {
					this.$message({
						message: "服务发生错误！",
						type: "error"
					})
					return
				}
			}
		},
		AddDI(selnode) {
			var parentid;
			if (selnode != null) {
				parentid = selnode.id;
			} else
				parentid = null;

			this.AddData = true;
			var newkeyid = getNewID("MDB", "DOC_GROUP", "DOCGROUPID", "GP", 3);
			if (!newkeyid || newkeyid == '') {
				newkeyid = 'GP001'
			}

			this.Doc_Group = {
				"APPID": getUrlParam("appid"), //子系统名称
				"APPMODELID": getUrlParam("modelid"), //子系统下的模块名称
				"DOCGROUPID": newkeyid,
				"PARENTGROUPID": parentid,
				"DOCGROUPNAME": '',
				"DESCRIPTION": '',
				"AUTHOR": top.LogInfor.UserName,
				"CREATEDATE": newdate(),
				"APPROVEDBY": top.LogInfor.UserName,
				"APPROVALDATE": newdate()
			};
			this.$nextTick(() => {
				this.$refs['Doc_Group'].clearValidate();
			});
		},
		DelDI() {
			if (!this.selnode || !this.selnode.id) {
				this.$message({
					message: "请选择文档目录!",
					type: "error"
				})
				return;
			} else {
				this.$confirm('确定【删除】该文档目录对象吗？', '确认操作', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
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
						"v1": this.selnode.id,
						"v2": null
					}];
					if (this.selnode.children && this.selnode.children.length > 0) {
						this.$message({
							message: "目录下存在其他目录节点，请清除其他目录节点，再进行该节点的删除!",
							type: "error"
						})
						return;
					}
					var tempgroupdoc = loaddata("DOC_DOCUMENT", _cons);
					var tempflag = tempgroupdoc.d ? true : false;
					var groupdoc = [];
					if (tempflag) {
						groupdoc = $.Enumerable.From(tempgroupdoc.d).ToArray();
						if (groupdoc.length > 0) {
							this.$message({
								message: "目录下存在文件,请在“文档资料信息管理”功能中将该目录下的文件删除后再试!",
								type: "error"
							})
							return;
						}
					}

					var ret = GetorDelData("mdb\\del", "DOC_GROUP", [{
						"cn": "DOCGROUPID",
						"cp": "=",
						"v1": this.selnode.id,
						"v2": null
					}]);
					var retresult = RequestHd(ret);
					var tempdelflag = retresult.d ? true : false;
					if (tempdelflag) {
						if (retresult.s === 0) {
							addUserOperLog("在【文档资料目录配置】页面【删除】了文档资料目录【" + this.selnode.label + "】", top.LogInfor.UserName, top.LogInfor.clientip);
							this.AllGroupID.splice($.inArray(this.Doc_Group.DOCGROUPID, this.AllGroupID), 1);
							if (this.selnode.parentid != null) {
								var pNode = FindultreeNode(this.nodes, this.selnode.parentid);
								var index = $.inArray(this.selnode, pNode.children);
								pNode.children.splice($.inArray(this.selnode, pNode.children), 1); //删除树非根节点，需要找到父节点，在父节点的children对象中删除
							} else if (this.selnode.parentid == null) //若选中树节点的parentid==null则该节点为根节点，需直接从nodes中删除
							{
								this.nodes.splice($.inArray(this.selnode, this.nodes), 1); //删除树根节点
								DocGroupForm.isRootUndefined = true;
							}
							DocGroupForm.Doc_Group = {}; //删除完成后初始化form为空，
							this.selnode = null; //初始化选中树节点为空
							this.$message({
								message: "删除成功！",
								type: "success"
							})
							return;
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
		SaveDI() {
			this.$confirm('确定对该【编辑】文档目录对象进行保存操作吗？', '确认操作', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$refs.Doc_Group.validate((valid) => {
					if (valid) {
						if (this.AddData) {
							this.Doc_Group.AUTHOR = top.LogInfor.UserName;
							this.Doc_Group.CREATEDATE = newdate();
						}
						this.Doc_Group.APPROVEDBY = top.LogInfor.UserName;
						this.Doc_Group.APPROVALDATE = newdate();
						if (this.AddData) {
							var _addval = {
								"DOCGROUPID": this.Doc_Group.DOCGROUPID,
								"APPID": getUrlParam("appid"),
								"APPMODELID": getUrlParam("modelid"),
								"DOCGROUPNAME": this.Doc_Group.DOCGROUPNAME,
								"DESCRIPTION": this.Doc_Group.DESCRIPTION,
								"AUTHOR": top.LogInfor.UserName,
								"CREATEDATE": "datetime" + "(" + newdate() + ")",
								"APPROVEDBY": top.LogInfor.UserName, //修改人
								"APPROVALDATE": "datetime" + "(" + newdate() + ")", //修改时间
								"PARENTGROUPID": this.Doc_Group.PARENTGROUPID
							};
							var addR = addData("mdb\\add", "DOC_GROUP", _addval);
							var addS = RequestHd(addR);
							if (addS.s === 0) {
								this.$message({
									message: "新增成功!",
									type: "success"
								})
								this.AllGroupID.push(this.Doc_Group.DOCGROUPID);
								addUserOperLog("在【文档资料目录配置】页面" + (this.selnode ? "的【" + this.selnode.label + "】目录下" : "") + "【添加】了文档资料目录【" + this.Doc_Group.DOCGROUPNAME + "】", top.LogInfor.UserName, top.LogInfor.clientip);
							} else {
								this.$message({
									message: addS.m,
									type: "error"
								})
								return;
							}
						} else {
							var _upval = {
								"DOCGROUPNAME": this.Doc_Group.DOCGROUPNAME,
								"DESCRIPTION": this.Doc_Group.DESCRIPTION,
								"APPROVEDBY": top.LogInfor.UserName, //修改人
								"APPROVALDATE": "datetime" + "(" + newdate() + ")", //修改时间
							};
							var saveR = saveData("DOC_GROUP", _upval, [{
								"cn": "DOCGROUPID",
								"cp": "=",
								"v1": this.Doc_Group.DOCGROUPID,
								"v2": null
							}]);
							var saveS = RequestHd(saveR);
							if (saveS.s === 0) {
								this.$message({
									message: "修改成功!",
									type: "success"
								});
								addUserOperLog("在【文档资料目录配置】页面" + (this.selnode ? "的【" + this.selnode.label + "】目录下" : "") + "【修改】了文档资料目录【" + this.Doc_Group.DOCGROUPNAME + "】", top.LogInfor.UserName, top.LogInfor.clientip);
							} else {
								this.$message({
									message: saveS.m,
									type: "error"
								})
								return;
							}
						}
						var newnode = {
							id: this.Doc_Group.DOCGROUPID,
							label: this.Doc_Group.DOCGROUPNAME,
							parentid: this.Doc_Group.PARENTGROUPID,
							initcollapsed: true,
							enable: true,
							checkbox: false,
							checkable: false,
							selected: false,
							children: [],
							nodeobj: DocGroupForm.Doc_Group,
						};
						if (this.AddData) { //若为新增节点
							if (this.selnode != null) {
								this.selnode.children.push(newnode); //添加非根节点
							} else {
								this.nodes.push(newnode); //添加根节点
								this.isRootUndefined = false;
							}

							this.treenodeclick(newnode); //选中新增的对象树节点
						} else { //若为修改节点
							this.selnode.label = newnode.label; //直接改变选中设备树节点的lable
							this.selnode.nodeobj = newnode.nodeobj;
						}
						this.AddData = false;

					} else {
						this.$message({
							message: "请确认填写无误之后再进行保存！",
							type: "warning"
						});
						this.$nextTick(() => {
							this.$refs['Doc_Group'].clearValidate();
						})
						return
					}
				});
			}).catch(() => {
				this.$message({
					message: "已取消保存！",
					type: "warning"
				})
				return;
			})
		},
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
			nodeicon: (iLevel % 2 == 0) ? 'iconpr iconfont icon-yewudanyuan' : 'iconfont icon-luxianyunshuliuliangtongji iconpr',
			nodeobj: nodedata,
		};
		node.children = GetTreeNode(nodedata.DOCGROUPID, iLevel + 1); //获取再下一层节点数组
		node.isleaf = (node.children.length == 0) ? true : false; //是否为叶子节点，初始全为false，若node中的children数组长度为零则标记true
		nodes.push(node);
	});
	return nodes;
}
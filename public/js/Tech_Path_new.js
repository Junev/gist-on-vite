var myvue = new Vue({
    el: '#myvue',
    data: {
        expandTreeData: [], //默认展开

        //左：树相关
        treedata: [],
        mrecipetreedata: [],
        mrecipetreeprops: { //treedata 参数定义
            children: 'children', //treedata中子节点的对象名
            label: 'nlabel' //treedata中用于label显示的项
        },
        selnode: null, //用于加载数据
        pathlist: [], //路径列表
        sel_unitlist: [], //单元选择
        processcell_filt: $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", []).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray() // 生产工段
    },
    mounted() {
        this.inittree();
        this.load_unittree();
        var el = document.getElementById('cardtable');
        Sortable.create(el, {
            animation: 500,
            fallbackOnBody: true
        });
    },
    methods: {
        //左：树相关
        //初始化树
        inittree() {
            this.mrecipetreedata = [];
            this.treedata = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", [{
                "cn": "EQUCLASSID",
                "cp": "!=",
                "v1": "Unit",
                "v2": null
            }]).d).OrderBy("$.EQUIPMENTID").OrderBy("$.SHOWINDEX").ToArray();
            if (this.treedata && this.treedata.length > 0) {
                var rootload = this.treedata.filter(a => a.CONTAINEDIN == null)[0];
                if (rootload) {
                    this.expandTreeData = [];
                    rootload.nid = rootload.EQUIPMENTID;
                    rootload.nlabel = rootload.EQUIPMENTNAME;
                    this.getTreeNodedata(rootload);
                    this.expandTreeData.push(rootload.EQUIPMENTID);
                }
                this.mrecipetreedata = [rootload];
            }
        },
        getTreeNodedata(item) {
            item.children = this.treedata.filter(a => a.CONTAINEDIN == item.EQUIPMENTID)
            item.children.forEach(item2 => {
                item2.nid = item2.EQUIPMENTID;
                item2.nlabel = item2.EQUIPMENTNAME;
                this.getTreeNodedata(item2)
            })
        },
        // 点击树节点保存
        mrecipetreenodeclick(val) {
            this.selnode = val;
            this.pathlist = [];
            if (this.selnode.EQUCLASSID == 'Cell')
                this.load_path();
        },
        // 加载该工段下的路径
        load_path() {
            let pl = $.Enumerable.From(loaddata("BXT_CELLPATH", [{
                "cn": "CELLID",
                "cp": "=",
                "v1": this.selnode.EQUIPMENTID,
                "v2": null
            }]).d).OrderBy("$.PATHID").ToArray();
            if (pl && pl.length > 0) {
                pl.forEach(item => {
                    item.isset = 1;
                    item.cursel = '';
                    item.DETAIL = []
                    item.ORIGION_DETAIL = $.Enumerable.From(loaddata("BXT_CELLPATHUNIT", [{
                        "cn": "PATHID",
                        "cp": "=",
                        "v1": item.PATHID,
                        "v2": null
                    }]).d).OrderBy("$.PRIORITY").ToArray();
                })
            }
            this.pathlist = pl;
            setTimeout(() => {
                this.pathlist.forEach(a => {
                    var that = this
                    let el = document.getElementById(a.PATHID);
                    Sortable.create(el, {
                        animation: 500,
                        onEnd: function (evt) {
                            //console.log(evt)
                            //console.log(evt.item.__vue__.$attrs.id)
                            let rec = evt.item.__vue__.$attrs.id.toString();
                            let pathid = rec.split("_")[0]
                            let unitid = rec.split("_")[1]
                            if (evt.newIndex != evt.oldIndex) {
                                //console.log(evt.newIndex, evt.oldIndex)
                                //console.log('1',JSON.parse(JSON.stringify(that.pathlist.find(a => a.PATHID == pathid).ORIGION_DETAIL)))
                                var temp_detail = JSON.parse(JSON.stringify(that.pathlist.find(a => a.PATHID == pathid).ORIGION_DETAIL))
                                let curr1 = temp_detail[evt.newIndex]
                                let curr2 = temp_detail[evt.oldIndex]
                                //console.log(curr1,curr2)
                                temp_detail[evt.oldIndex] = {
                                    PATHID: pathid,
                                    PRIORITY: 0,
                                    UNITID: ''
                                }
                                //console.log(temp_detail)
                                if (evt.newIndex > evt.oldIndex) {
                                    temp_detail.splice(evt.newIndex + 1, 0, curr2)
                                } else {
                                    temp_detail.splice(evt.newIndex, 0, curr2)
                                }
                                temp_detail.splice(temp_detail.indexOf(temp_detail.find(b => b.UNITID == '')), 1)
                                that.pathlist.find(a => a.PATHID == pathid).DETAIL = temp_detail
                                setTimeout(() => {
                                    that.$set(that.pathlist.find(a => a.PATHID == pathid), 'ORIGION_DETAIL', [])
                                }, 50)

                                setTimeout(() => {
                                    that.$set(that.pathlist.find(a => a.PATHID == pathid), 'ORIGION_DETAIL', temp_detail)
                                }, 60)
                                that.pathlist.find(a => a.PATHID == pathid).isset = 2
                                //console.log('2',JSON.parse(JSON.stringify(that.pathlist.find(a => a.PATHID == pathid).ORIGION_DETAIL)))
                            }
                        }

                    });
                })
            }, 500)
        },
        // 加载工段下的单元
        load_unit(_cellid) {
            return this.processcell_filt.filter(a => a.CONTAINEDIN == _cellid)
        },
        // 通过ID返回设备名称
        unit_filter(_cellid) {
            let temp = this.processcell_filt.filter(a => a.EQUIPMENTID == _cellid)
            if (temp && temp.length > 0) {
                return temp[0].EQUIPMENTNAME
            } else {
                return _cellid
            }
        },
        // 新增路径
        add_route(node) {
            if (this.pathlist.find(x => x.isset == 0)) {
                this.$message.warning("路径模型已经添加好啦，直接编辑吧~");
                return;
            }

            let new_item = {
                cursel: '',
                isset: 0,
                CELLID: node.EQUIPMENTID,
                PATHID: this.new_path('id'),
                PATHNAME: this.new_path('name'),
                DETAIL: [],
                ORIGION_DETAIL: []
            };
            this.pathlist.unshift(new_item)
            setTimeout(() => {
                this.pathlist.forEach(a => {
                    var that = this
                    let el = document.getElementById(a.PATHID);
                    Sortable.create(el, {
                        animation: 500,
                        fallbackOnBody: true,
                        onEnd: function (evt) {
                            //console.log(evt)
                            //console.log(evt.item.__vue__.$attrs.id)
                            let rec = evt.item.__vue__.$attrs.id.toString();
                            let pathid = rec.split("_")[0]
                            let unitid = rec.split("_")[1]
                            if (evt.newIndex != evt.oldIndex) {
                                //console.log(evt.newIndex, evt.oldIndex)
                                //console.log('1',JSON.parse(JSON.stringify(that.pathlist.find(a => a.PATHID == pathid).ORIGION_DETAIL)))

                                var temp_detail = JSON.parse(JSON.stringify(that.pathlist.find(a => a.PATHID == pathid).ORIGION_DETAIL))
                                let curr1 = temp_detail[evt.newIndex]
                                let curr2 = temp_detail[evt.oldIndex]
                                //console.log(curr1,curr2)
                                temp_detail[evt.oldIndex] = {
                                    PATHID: pathid,
                                    PRIORITY: 0,
                                    UNITID: ''
                                }
                                //console.log(temp_detail)
                                if (evt.newIndex > evt.oldIndex) {
                                    temp_detail.splice(evt.newIndex + 1, 0, curr2)
                                } else {
                                    temp_detail.splice(evt.newIndex, 0, curr2)
                                }
                                temp_detail.splice(temp_detail.indexOf(temp_detail.find(b => b.UNITID == '')), 1)

                                that.pathlist.find(a => a.PATHID == pathid).DETAIL = temp_detail
                                setTimeout(() => {
                                    that.$set(that.pathlist.find(a => a.PATHID == pathid), 'ORIGION_DETAIL', [])
                                }, 50)

                                setTimeout(() => {
                                    that.$set(that.pathlist.find(a => a.PATHID == pathid), 'ORIGION_DETAIL', temp_detail)
                                }, 60)
                                that.pathlist.find(a => a.PATHID == pathid).isset = 2
                                //console.log('2',JSON.parse(JSON.stringify(that.pathlist.find(a => a.PATHID == pathid).ORIGION_DETAIL)))
                            }
                        }
                    });
                })
            }, 500)
            this.$forceUpdate()
        },
        // 保存路径
        save_route(item) {
            let routedata = JSON.parse(JSON.stringify(item));
            let mk = JSON.parse(JSON.stringify(routedata.PATHID));
            let detail = JSON.parse(JSON.stringify(routedata.ORIGION_DETAIL))
            //判断ID和名称是否为空
            if (item.PATHID == '' || item.PATHNAME == '') {
                this.$message.warning("必填项不可为空！");
                return;
            } else if (this.pathlist.filter(a => a.PATHID == item.PATHID).length > 1) {
                this.$message.warning("路径编码重复！");
                return;
            }
            // 检查该类路径是否存在数据库里
            check1 = loaddata("BXT_CELLPATH", [{
                "cn": "PATHID",
                "cp": "=",
                "v1": mk,
                "v2": null
            }]).d;
            delete routedata.cursel
            delete routedata.isset
            delete routedata.DETAIL
            delete routedata.ORIGION_DETAIL
            if (check1 && check1.length > 0) { //如果存在，执行修改操作
                delete routedata.PATHID
                if (updateMDBData("BXT_CELLPATH", routedata, [{
                        "cn": "PATHID",
                        "cp": "=",
                        "v1": mk,
                        "v2": null
                    }]) == 0) {
                    // 如果路径修改成功，则修改单元
                    let status = RequestHd(GetorDelData("mdb\\del", "BXT_CELLPATHUNIT", [{
                        "cn": "PATHID",
                        "cp": "=",
                        "v1": item.PATHID,
                        "v2": null
                    }])).s
                    if (status == 0) {
                        if (detail && detail.length > 0) {
                            detail.forEach((dt, idx) => {
                                dt.PRIORITY = idx + 1
                                addMDBData("BXT_CELLPATHUNIT", dt)
                            })
                        }
                    }
                    item.isset = 1;
                    this.$message.success("修改路径成功");
                    addUserOperLog("在【生产工艺路线配置】页面【" + this.unit_filter(item.CELLID) + "】工段下【修改】了路径【名称:" + item.PATHNAME + "   编码:" + item.PATHID + "】", top.LogInfor.UserName, top.LogInfor.clientip);
                } else {
                    this.$message.error("修改路径失败");
                }
            } else { //不存在执行新增操作
                if (addMDBData("BXT_CELLPATH", routedata) == 0) {
                    // 如果路径修改成功，则修改单元
                    if (detail && detail.length > 0) {
                        detail.forEach((dt, idx) => {
                            dt.PRIORITY = idx + 1
                            addMDBData("BXT_CELLPATHUNIT", dt)
                        })
                    }
                    item.isset = 1;
                    this.$message.success("新增路径成功");
                    addUserOperLog("在【生产工艺路线配置】页面【" + this.unit_filter(item.CELLID) + "】工段下【新增】了路径【名称:" + item.PATHNAME + "    编码:" + item.PATHID + "】", top.LogInfor.UserName, top.LogInfor.clientip);
                } else {
                    this.$message.error("新增路径失败");
                }
            }

        },
        // 删除路径
        del_route(item) {

            if (item.isset == 0) {
                this.remove_route(item);
                return;
            }
            this.$confirm('确认定要删除该路径模型吗？')
                .then(() => {
                    //检查该路径是否在数据库中存在
                    let check = loaddata("BXT_CELLPATH", [{
                        "cn": "PATHID",
                        "cp": "=",
                        "v1": item.PATHID,
                        "v2": null
                    }]).d
                    if (check && check.length > 0) { //若存在才执行操作
                        let status1 = RequestHd(GetorDelData("mdb\\del", "BXT_CELLPATH", [{
                            "cn": "PATHID",
                            "cp": "=",
                            "v1": item.PATHID,
                            "v2": null
                        }])).s;
                        let status2 = RequestHd(GetorDelData("mdb\\del", "BXT_CELLPATHUNIT", [{
                            "cn": "PATHID",
                            "cp": "=",
                            "v1": item.PATHID,
                            "v2": null
                        }])).s;
                        if (status1 == 0 && status2 == 0) {
                            this.$message.success("删除路径成功");
                            this.remove_route(item);
                            addUserOperLog("在【生产工艺路线配置】页面【" + this.unit_filter(item.CELLID) + "】工段下【删除】了路径【名称:" + item.PATHNAME + "    编码:" + item.PATHID + "】", top.LogInfor.UserName, top.LogInfor.clientip);
                        }
                    } else { // 否则返回
                        this.remove_route(item);
                        return;
                    }
                })
                .catch(() => {

                });

        },
        //添加单元
        add_unit(item) {
            var temp_cursel = item.cursel[item.cursel.length - 1]
            if (item.ORIGION_DETAIL.find(a => a.UNITID == temp_cursel)) {
                this.$message.error("该路径下存在重复单元！");
                return;
            }
            if (item.cursel[item.cursel.length - 2] != this.selnode.EQUIPMENTID) {
                this.$confirm('确定要添加跨工段单元吗？')
                    .then(() => {
                        let new_item = {
                            PATHID: item.PATHID,
                            UNITID: temp_cursel,
                        };
                        item.ORIGION_DETAIL.push(new_item)
                        item.DETAIL.push(new_item)
                        item.isset = 2;
                        return;
                    })
                    .catch(() => {
                        return;
                    })
            } else {
                let new_item = {
                    PATHID: item.PATHID,
                    UNITID: temp_cursel,
                };
                item.ORIGION_DETAIL.push(new_item)
                item.DETAIL.push(new_item)
                item.isset = 2;
            }

        },
        //移除单元
        remove_unit(item, unit) {
            let idx = item.ORIGION_DETAIL.indexOf(item.ORIGION_DETAIL.find(a => a.UNITID == unit.UNITID))
            if (idx != -1) {
                item.ORIGION_DETAIL.splice(idx, 1)
                item.DETAIL.splice(idx, 1)
            }
            item.isset = 2;
        },
        //移除路径
        remove_route(item) {
            let idx = this.pathlist.indexOf(this.pathlist.find(a => a.PATHID == item.PATHID))
            if (idx != -1) {
                this.pathlist.splice(idx, 1)
            }
            item.isset = 2;
        },
        //给予新建路径后该路径的前缀，可定制修改 2022-07-22 zyp
        new_path(mark) {
            if (mark == 'id') {
                var havpath = loaddata("BXT_CELLPATH", [{
                    "cn": "CELLID",
                    "cp": "=",
                    "v1": this.selnode.EQUIPMENTID,
                    "v2": null
                }]).d;
                if (havpath && havpath.length > 0) {
                    var temppaths = $.Enumerable.From(havpath).OrderByDescending("$.PATHID").ToArray();
                    var maxid = temppaths[0].PATHID;
                    var index = parseInt(maxid.slice(-2)) + 1; //只截取最后的数字位
                    return this.selnode.EQUIPMENTID + 'L0' + index.toString()
                } else {
                    return this.selnode.EQUIPMENTID + 'L01'
                }

            } else if (mark == 'name') {
                return this.selnode.EQUIPMENTNAME
            }
        },
        //加载工艺单元树,用以跨段调用(全工段)
        load_unittree() {
            var all_data = $.Enumerable.From(loaddata("BXT_EQUIPELEMENT", []).d).OrderBy("$.EQUIPMENTID").ToArray()
            var area = all_data.filter(item => item.EQUCLASSID == 'Area')
            var return_data = []
            area.forEach(item => {
                var obj = {
                    value: item.EQUIPMENTID,
                    label: item.EQUIPMENTNAME,
                    children: []
                }
                obj.children = this.load_process("Cell", all_data, item.EQUIPMENTID, "CONTAINEDIN")
                if (obj.children && obj.children.length > 0) {
                    for (let i = 0; i < obj.children.length; i++) {
                        obj.children[i].children = this.load_process("Unit", all_data, obj.children[i].EQUIPMENTID, "CONTAINEDIN")
                    }
                }
                return_data.push(obj)
            })
            this.sel_unitlist = return_data
        },
        //加载对应工段或单元
        load_process(method, all_data, target, need) {
            let temp_data = []
            all_data.filter(item => item.EQUCLASSID == method).filter(item => item[need] == target).forEach(item => {
                let obj = {
                    value: item.EQUIPMENTID,
                    label: item.EQUIPMENTNAME,
                    EQUIPMENTID: item.EQUIPMENTID
                }
                temp_data.push(obj)
            })
            return temp_data
        }
    }
})
Vue.component('ultree', {
    name: "ultree",
    template: `<ul v-bind:class="['list-group','collapse',curnodelevel?(initcollapsed?'show':'hide'):'show']">
                             <li v-for= "node in nodes" v-bind:class ="['list-group-item','ultreeNode',selnode && selnode.enable && selnode.id==node.id?(listgroupitemcolor!='list-group-item-success'?'list-group-item-success':'list-group-item-primary'):(listgroupitemcolor?listgroupitemcolor:''), selnode && selnode.id==node.id?'font-weight-bold':'']">
                                <div v-bind:class ="['ultreeNodeTitle', curnodelevel==null?'indent-0':'indent-'+curnodelevel]" v-bind:style="{fontSize: fontsize}">
                                    <a v-bind:id="treeid+node.id" data-toggle="collapse" v-bind:class ="[node.initcollapsed?'lapsed':'unlapsed',node.enable?enablenodecolor:disablenodecolor,'float-left']" v-bind:href="node.children && node.children.length>0?('#'+treeid+'cs'+node.id):'#'" @click= "ultreeNodeClick(treeid,node);treenodeclick(node);">
                                        <span v-if="node.children && node.children.length>0" class ="lapseicon"></span>
                                       {{ node.label }}
                                    </a>
                                    <div v-if="node.badges && node.badges.length>0" class ="p-2">
                                         <span v-for="badgex in node.badges" v-bind:class ="['badge', 'badge-pill', 'ml-1', badgex.badgeclass,'float-left']" v-bind:title="badgex.badgedesc">{{ badgex.badge }}</span>
                                    </div>
                                    <div v-if="node.options && node.options.length>0" class ="p-2">
                                         <select class="form-control rounded text-info" v-bind:disabled="disabled || !node.enable" v-model="node.optionval" v-bind:style="{fontSize: fontsize}" @change="optionvalchanged(node);">
                                            <option v-for="ox in node.options" v-bind:value="ox.value" v-bind:style="{fontSize: fontsize}">{{ox.label}}</option>
                                         </select>
                                    </div>
                                    <input type="checkbox" v-if="node.checkbox" v-bind:disabled="!node.checkable || disabled" class ="m-2" v-model="node.selected" @click= "if(node.checkable && !disabled) {treenodecheck(node);ultreeNodeCheck(node);}">
                                </div>

                                <ultree v-bind:treeid="treeid+'cs'+node.id" v-bind:id="treeid+'cs'+node.id" v-if="node.children && node.children.length>0" v-bind:disabled= "disabled" v-bind:nodes= "node.children"  v-bind:initcollapsed= "node.initcollapsed" v-bind:curnodelevel= (curnodelevel?curnodelevel+1:1) v-bind:multiselect = "multiselect"  v-bind:listgroupitemcolor= "listgroupitemcolor"  v-bind:enablenodecolor = "enablenodecolor"  v-bind:disablenodecolor= "disablenodecolor"  v-bind:fontsize= "fontsize" v-bind:selnode= "selnode" v-bind:treenodeclick= "treenodeclick" v-bind:treenodecheck = "treenodecheck" v-bind:optionvalchanged = "optionvalchanged"></ultree>
                            </li>
                       </ul>`,
    props: ["treeid", "nodes", "disabled", "treenodeclick", "treenodecheck","optionvalchanged", "curnodelevel", "initcollapsed", "listgroupitemcolor", "enablenodecolor", "disablenodecolor", "multiselect", "selnode", 'fontsize'],
});
function ultreeNodeClick(treeid,node) {
    try {
        $treenodex = $('#' + treeid + node.id);
        if ($treenodex.hasClass("lapsed")) {
            $treenodex.removeClass("lapsed").addClass("unlapsed");
        }
        else {
            $treenodex.removeClass("unlapsed").addClass("lapsed");
        }
    }
    catch (e) { }
    //try {
    //    if (node.enable && node.checkbox && node.checkable) {
    //        node.selected = !node.selected;
    //    }
    //}
    //catch (e) { }
}
function ultreeNodeCheck(node) {
    try {
        if (node.checkbox && node.checkable && node.checkwithchild) {
            $(node.children).each(
            function (i, cnodex) {
                if (cnodex.enable && node.checkbox && node.checkable)
                    cnodex.selected = !node.selected;
            });
        }
    }
    catch (e) { }
}
//获取被勾选中的所有节点对象，checkbox节点多选可用    
function GetultreeSelNodes(nodes) {
    try {
        var selnodes = [];
        $.each(nodes, function (index, s) {//每一个根节点
            getultreenodeselnodes(selnodes, s);
        });
        return selnodes;
    }
    catch (e) { }
}
function getultreenodeselnodes(selnodes,nodex) {
    try {
        if (nodex.selected)
            selnodes.push(nodex);
        if (nodex.children) {
            $.each(nodex.children, function (index, s) {//每一个子节点
                getultreenodeselnodes(selnodes, s);
            });
        }
    }
    catch (e) { }
}
//设置被勾选中的所有节点对象，checkbox节点多选可用    
function SetultreeSelNodes(nodes,ids) {
    try {
        $.each(nodes, function (index, s) {//每一个根节点
            setultreenodeselnodes(s,ids);
        });
    }
    catch (e) { }
}
function setultreenodeselnodes(nodex,ids) {
    try {
        nodex.selected = ids.includes(nodex.id);
        if (nodex.children) {
            $.each(nodex.children, function (index, s) {//每一个子节点
                setultreenodeselnodes(s,ids);
            });
        }
    }
    catch (e) { }
}
//遍历树，查找给定nodeid的节点对象
function FindultreeNode(nodes, id) {
    var _result = null;
    $.each(nodes, function (index, nodex) {//每一个节点
        if (nodex.id == id)
            _result = nodex;
        if (_result == null && nodex.children) {
            _result = FindultreeNode(nodex.children, id)
        }
    });
    return _result;
}
function SetultreeNodeOptionval(nodes, ovs) {
    $.each(ovs, function (index, vx) {
        var nodex = FindultreeNode(nodes, vx.id);
        if (nodex)
            nodex.optionval = vx.value;
    });
}
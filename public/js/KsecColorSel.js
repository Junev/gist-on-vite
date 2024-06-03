var KsecColorSel = {
    show: function (callback) {
        var $inputctl = $("#kseccolorsel");
        if($inputctl.length==0){            
            $inputctl = $(`<div id="kseccolorsel" class="modal fade" aria-hidden="true" data-backdrop="static" data-keyboard="false" style="height:100%;max-height:100%;">
                            <div class ="modal-dialog" style="width: 200px;">
                                <div class="modal-content">
                                    <div class="modal-body d-flex flex-column">
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-primary w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('primary');"><h4>重要的</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-success w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('success');"><h4>成功的</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-info w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('info');"><h4>信息提示</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-warning w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('warning');"><h4>警告的</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-danger w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('danger');"><h4>危险的</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-secondary w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('secondary');"><h4>副标题</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-dark w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('dark');"><h4>深色的</h4></button>
                                        </div>
                                        <div class ="m-1">
                                            <button type="button" class ="btn btn-light w-100" data-dismiss="modal" onclick="KsecColorSel.colorseled('light');"><h4>浅色的</h4></button>
                                        </div>
                                    </div>
                                    <div class ="modal-footer d-flex flex-column">
                                        <button type="button" class ="btn btn-secondary m-1 flex-grow-1" data-dismiss="modal">&nbsp; &nbsp; 返&nbsp; 回&nbsp; &nbsp; </button>
                                    </div>
                                </div>
                            </div>
                        </div>`);
            $inputctl.appendTo(document.body);
        }
        $inputctl.modal('show');
        this.colorseled = callback;
    },
    colorseled(val) {
        return;
    }
};
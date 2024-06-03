var KsecTextInput ={
    show: function (val,callback) {
        var $inputctl = $("#ksectextinput");
        if($inputctl.length==0){            
            $inputctl = $(`<div id="ksectextinput" class="modal fade" aria-hidden="true" data-backdrop="static" data-keyboard="false" style="height:100%;max-height:100%;">
                            <div class ="modal-dialog" style="width: 400px;">
                                <div class="modal-content">
                                    <div class ="modal-body d-flex flex-column">
                                        <div class ="mb-2"> <span class ="badge badge-info"><h5>文本信息录入：</h5></span></div>
                                        <div class="input-group input-group-lg mb-1">
                                            <textarea id="KsecTextInputValue" class ="form-control text-primary" rows="4"></textarea>
                                        </div>                                   
                                    </div>
                                    <div class ="modal-footer">
                                        <button type="button" class ="btn btn-primary mr-1" onclick="KsecTextInput.textinputed($('#KsecTextInputValue').val());" data-dismiss="modal">&nbsp; &nbsp; 确&nbsp; 认&nbsp; &nbsp; </button>
                                        <button type="button" class ="btn btn-secondary mr-1" data-dismiss="modal">&nbsp; &nbsp; 返&nbsp; 回&nbsp; &nbsp; </button>
                                    </div>
                                </div>
                            </div>
                        </div>`);
            $inputctl.appendTo(document.body);
        }
        $inputctl.modal('show');
        $('#KsecTextInputValue').val(val);
        this.textinputed = callback;
    },
    textinputed(val) {
        return;
    }
};
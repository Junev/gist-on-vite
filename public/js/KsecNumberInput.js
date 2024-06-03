var KsecNumberInput ={
    show: function (val,callback) {
        var $inputctl=$("#ksecnumberinput");
        if($inputctl.length==0){            
            $inputctl = $(`<div id="ksecnumberinput" class="modal fade" aria-hidden="true" data-backdrop="static" data-keyboard="false" style="height:100%;max-height:100%;">
                            <div class ="modal-dialog" style="width: 400px;">
                                <div class="modal-content">
                                    <div class="modal-body d-flex flex-column">
                                        <div class="input-group input-group-lg mb-1">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text">输入值：</span>
                                            </div>
                                            <input id="KsecNumberInputValue" type="text" class ="form-control font-weight-bold" style="font-size:1.5em">
                                        </div>
                                        <div class ="d-flex">
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '1'));"><h4>1</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '2'));"><h4>2</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '3'));"><h4>3</h4></button></div>
                                        </div>
                                        <div class ="d-flex">
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '4'));"><h4>4</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '5'));"><h4>5</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '6'));"><h4>6</h4></button></div>
                                        </div>
                                        <div class ="d-flex">
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '7'));"><h4>7</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '8'));"><h4>8</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val(parseFloat($('#KsecNumberInputValue').val()+ '9'));"><h4>9</h4></button></div>
                                        </div>
                                        <div class ="d-flex">
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val($('#KsecNumberInputValue').val()+ '0');"><h4>0</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="if($('#KsecNumberInputValue').val().indexOf('.') < 0) $('#KsecNumberInputValue').val($('#KsecNumberInputValue').val()+ '.');"><h4>.</h4></button></div>
                                        </div>
                                        <div class ="d-flex">
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val($('#KsecNumberInputValue').val().startsWith('-')?$('#KsecNumberInputValue').val().replace('-',''):('-'+$('#KsecNumberInputValue').val()));"><h4>+/-</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="var ssss=$('#KsecNumberInputValue').val();if(ssss.length>0){$('#KsecNumberInputValue').val(ssss.substr(0,ssss.length-1));}"><h4>回退</h4></button></div>
                                            <div class ="flex-fill m-1 box1"><button type="button" class ="btn btn-secondary btn-outline-secondary" style="width:100%;" onclick="$('#KsecNumberInputValue').val('');"><h4>清空</h4></button></div>
                                        </div>
                                    </div>
                                    <div class ="modal-footer">
                                        <button type="button" class ="btn btn-primary mr-1" onclick="KsecNumberInput.numberinputed($('#KsecNumberInputValue').val());" data-dismiss="modal">&nbsp; &nbsp; 确&nbsp; 认&nbsp; &nbsp; </button>
                                        <button type="button" class ="btn btn-secondary mr-1" data-dismiss="modal">&nbsp; &nbsp; 返&nbsp; 回&nbsp; &nbsp; </button>
                                    </div>
                                </div>
                            </div>
                        </div>`);
            $inputctl.appendTo(document.body);
        }
        $inputctl.modal('show');
        $('#KsecNumberInputValue').val(val);
        this.numberinputed = callback;
    },
    numberinputed(val) {
        return;
    }
};
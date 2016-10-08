// require("./baseController");
// require("../lib/font-awesome/css/font-awesome.css");
// require("../style/base.scss");

// require("../style/login.scss");
console.log("1啊啊啊")

var ajax = require("ajax")();

avalon.define({
    $id: 'test',
    show: function(){
        this.config.isShow = true
    },
    addressConfig: {
        SelectDatas: [],
    },
     fullName: {//一个包含set或get的对象会被当成PropertyDescriptor，
        set: function(val) {//里面必须用this指向scope，不能使用scope
        },
        get: function() {
            return "avalon";
        }
    },
    config: {
        isShow: false,
        onCancel: function(){
            alert('cancel')
        },
        onOk: function(){
            alert('ok')
        },
        title:'这是测试'
    }
})
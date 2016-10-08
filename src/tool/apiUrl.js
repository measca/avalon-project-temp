exports.user = {
    login: "api/userInfo", //登录地址
    register: { //注册账号地址  --可以设置为属性形式(更多可设置的属性可以阅读ajax.js文件)
        url: ""
    },
    forget: "",//忘记账号的地址
    userInfo: "api/userInfo",//获取用户信息
}

exports.share = {
    sendCode: "",//发送验证码地址
    userMenu:"api/indexMenu",//获取用户所拥有的菜单
}
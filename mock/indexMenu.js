module.exports = [
    "常用菜单",
    {
        "title": "主页",
        "icon": "fa fa-home",
        "link": "/"
    },
    {
        "title": "项目管理",
        "icon": "fa fa-cubes",
        "number": 10,
        "link": "/project"
    },
    "系统菜单",
    {
        "title": "人员管理",
        "icon": "fa fa-user",
        "child": [
            {
                "title": "添加人员"
            },
            {
                "title": "设置人员",
                "child": [
                    {
                        "title": "权限设置"
                    }
                ]
            }
        ]
    }
]
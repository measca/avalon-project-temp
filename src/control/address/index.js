require("./style.scss");
var ajax = require("ajax")();
var pingYin = require("pingYin");

// ajax请求
function createNewTab(pId, url, successCallback, errorCallback) {
  setTimeout(function () {
    var arr = [{
      id: 1,
      name: "成都"
    }, {
        id: 2,
        name: "广东"
      }, {
        id: 3,
        name: "四川"
      }];
    var datas = {};
    for (var i = 0, d; d = arr[i++];) {
      var py = pingYin(d.name)[0];
      if (Object.prototype.toString.call(datas[py]) != '[object Array]') {
        datas[py] = [];
      }
      datas[py].push(d);
    }
    successCallback(datas);
  }, 500);
}

avalon.component('address', {
  template: require('text!./template.html'),
  defaults: {
    // 公开变量---------------------------------------------------------------
    ajax: {
      url: "",
      defaultVal: ""
    },
    placeholder: "请选择地区",
    // 选中的数据
    SelectDatas: [],
    /**
     * 重置数据
     */
    reset: function () {
      this.__createNewTab(this.ajax.defaultVal);
    },

    // 私有变量-------------------------------------------------------------------
    __IsOpen: false,
    __IsShowMsg: false,
    __Msg: "",
    // 渲染的数据
    __Datas: [],

    // 私有方法------------------------------------------------------------
    __createNewTab: function (id) {
      var self = this;
      self.__IsShowMsg = true;
      self.__Msg = "正在获取数据...";
      createNewTab(id, self.ajax.url, function (datas) {
        self.__IsShowMsg = false;
        self.__Datas.push({
          selectName: "请选择",
          isShow: true,
          selectId: -1,
          datas: datas
        });
      }, function () {
        self.__IsShowMsg = true;
        self.__Msg = "获取数据失败";
      });
    },
    // Tab 点击切换标签
    onTabClick: function (data) {
      this.__IsShowMsg = false;
      for (var i = 0, d; d = this.__Datas[i++];) {
        if (d == data)
          d.isShow = true;
        else
          d.isShow = false;
      }
    },
    // 子项点击时候触发
    onItemClick: function (index, selectData, data) {
      data.isShow = false;
      data.selectId = selectData.id;
      data.selectName = selectData.name;
      this.__Datas = this.__Datas.slice(0, index + 1);
      this.SelectDatas = this.SelectDatas.slice(0, index);
      this.SelectDatas.push(selectData);
      this.__createNewTab(data.selectId);
    },
    // 初始化
    onInit: function () {
      this.reset();
    }
  }
})

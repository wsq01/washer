var app = getApp();
var param={
  data: {
    userInfo: {},
    message:""
  },
  // 订单
  toMyOrder:function(){
    wx.navigateTo({
      url:'../order/order'
    })
  },
  onLoad: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  }
}
Page(param)
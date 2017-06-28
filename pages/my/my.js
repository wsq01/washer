var app = getApp()
Page({
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
  // 充值
  toRecharge:function(){
    wx.navigateTo({
      url: '../recharge/recharge'
    })
  },
  onLoad: function () {
    var that = this;
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
  }
})
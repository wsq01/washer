var app = getApp()
Page({
  data: {
    userInfo: {},
    message: "",
    myMin: 0,
    sid: '',
    url: '',
    test:''
  },
  onPullDownRefresh: function () {
    this.onLoad();
    wx.stopPullDownRefresh()
  },
  submit:function(e){
    console.log(e.detail)
    this.setData({
      test:e.detail.formId
    })
  },

  // 订单
  toMyOrder: function () {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  // 充值
  toRecharge: function () {
    wx.navigateTo({
      url: '../recharge/recharge'
    })
  },
  onLoad: function () {
    var that = this;
    that.setData({
      url: app.globalData.url,
      sid: app.globalData.sid
    })
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
    that.getUser();
  },
  // 用户协议
  agreement: function () {
    wx.navigateTo({
      url: '../agreement/agreement',
    })
  },
  // 充值历史
  history: function () {
    wx.navigateTo({
      url: '../history/history',
    })
  },
  //  获取余额
  getUser: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'user.php',
      data: {
        sid: that.data.sid,
        cmd: 'get'
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log('getUser')
        that.setData({
          myMin: res.data.min
        })
      }
    })
  },
  // 充值信息
  getRecharge: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'recharge.php',
      data: {
        sid: that.data.sid,
        cmd: 'get'
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res)
      }
    })
  },
  topup:function(){
    var that=this;
    wx.request({
      url: that.data.url + 'recharge.php',
      data: {
        sid: that.data.sid,
        cmd: 'add',
        topup: 100
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res);
        that.getUser();
      }
    })
  },
  // 微信付款
  resPayment: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'order.php',
      data: {
        openid: wx.getStorageSync('openid'),
        sid: that.data.sid,
        cmd: 'payJoinfee'
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + that.data.sid
      },
      success: function (res) {
        console.log('resPayment')
        var data = res.data.split("[")[0];
        data = JSON.parse(data);
        // 发起支付
        wx.requestPayment({
          'timeStamp': data.timeStamp,
          'nonceStr': data.nonceStr,
          'package': data.package,
          'signType': data.signType,
          'paySign': data.paySign,
          'success': function (res) {
            wx.showToast({
              title: '充值成功！',
              icon: 'success'
            })
            that.topup();
          }
        });
      }
    })
  },
  // 客服
  mackCall: function () {
    wx.makePhoneCall({
      phoneNumber: '010-64391589'
    })
  }
})
var app = getApp()
var money = 0
Page({
  data: {
    mymoney: 0,
    disabled: false,
    curNav: 0,
    sid:'',
    recharge:0,
    navList: [{
      id: 1,
      chongzhi: '充￥150',
      song: '送￥150',
      money: "150"
    },
    {
      id: 2,
      chongzhi: '充￥100',
      song: '送￥100',
      money: "100"
    },
    {
      id: 3,
      chongzhi: '充￥50',
      money: "50"
    },
    {
      id: 4,
      chongzhi: '充￥20',
      money: "20"
    }
    ],
  },
  //充值金额分类渲染模块
  selectNav:function(event) {
    console.log(event);
    var id = event.target.dataset.id,
      recharge=event.currentTarget.dataset.money
    this.setData({
      curNav: id,
      recharge:recharge
    })
  },
  //页面加载模块
  onLoad: function () {
    this.setData({
      sid:app.globalData.sid
    })
    this.getUser();
    // this.editRecharge();
  },
//  获取余额
getUser:function(){
  var that=this;
  wx.request({
    url: 'https://washer.mychaochao.cn/db/user.php',
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
      console.log(res);
      that.setData({
        mymoney:res.data.min
      })
    }
  })
},
// 充值信息
getRecharge:function(){
  var that = this;
  wx.request({
    url: 'https://washer.mychaochao.cn/db/recharge.php',
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
// 余额支付
editRecharge: function () {
  var that = this;
  wx.request({
    url: 'https://washer.mychaochao.cn/db/recharge.php',
    data: {
      sid: that.data.sid,
      cmd: 'edit',
      duration: 2000
    },
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'PHPSESSID=' + that.data.sid
    },
    success: function (res) {
      console.log(res);
      if (res.data.errno == "1") {
        
      }
    }
  })
},
  //去充值功能模块
  goblance: function (event) {
    var that = this;
    console.log(that.data.recharge);
    wx.request({
      url: 'https://washer.mychaochao.cn/db/recharge.php',
      data: {
        sid: that.data.sid,
        cmd: 'add',
        topup: that.data.recharge
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res);
        that.resPayment();  
      }
    })
  },
  // 微信付款
  resPayment: function () {
    var that = this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/order.php',
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
              icon:'success'
            })
            that.getUser();
          }
        });
      }
    })
  },
})
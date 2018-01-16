var app = getApp();
Page({
  data: {
    sid: '',
    historyItem: ''
  },
  onLoad: function () {
    this.setData({
      sid: app.globalData.sid
    })
    this.getHistory();
  },
  getHistory: function () {
    var that = this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/recharge.php',
      data: {
        sid: that.data.sid,
        cmd: 'get',
        user: wx.getStorageSync('uid')
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res);
        that.setData({
          historyItem: res.data.recharges
        })
        console.log(that.data.historyItem)
      }
    })
  }
})
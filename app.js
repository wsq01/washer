App({
  onLaunch: function () {
    var that = this;
    // 登录
    wx.login({
      success: function (res) {
        if (res.code) {
          // 用户登录接口
          wx.request({
            url: 'https://washer.mychaochao.cn/db/user.php',
            data: {
              cmd: "login",
              code: res.code
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res);
              wx.setStorageSync('openid', res.data.openid);
              wx.setStorageSync('sid', res.data.sid);
              that.globalData.sid = res.data.sid;
              wx.setStorageSync('uid', res.data.uid);
            }
          })
        } else {
          wx.showLoading({
            title: '获取用户登录状态失败！',
          })
          setTimeout(function () {
            wx.hideLoading()
          }, 1000)
        }
      }
    })
  },
  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    sid: "",
    userInfo: null
  }
})
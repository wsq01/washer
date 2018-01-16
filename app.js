App({
  onLaunch: function (options) {
    var that = this;
    that.login();
  },
  login: function () {
    var that = this;
    // 登录
    wx.login({
      success: function (res1) {
        if (res1.code) {
          // 用户登录接口
          wx.request({
            url: 'https://washer.mychaochao.cn/db/user.php',
            data: {
              cmd: "login",
              code: res1.code
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res)
              if (res.data.errno == "0") {
                wx.showModal({
                  title: '提示',
                  content: '登录失败！',
                  showCancel: false
                })
              } else if(res.data.errno =="1"){
                wx.setStorageSync('openid', res.data.openid);
                that.globalData.sid = res.data.sid;
                wx.setStorageSync('sid', res.data.sid);
                wx.setStorageSync('uid', res.data.uid);
              }
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
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        },
        fail:function(){
          wx.openSetting({
            success:function(res){
              res.authSetting={
                "scope.userInfo":true
              }
            }
          })
        }
      })
    }
  },
  globalData: {
    url:"https://washer.mychaochao.cn/db/",
    sid: wx.getStorageSync('sid'),
    userInfo: null
  }
})
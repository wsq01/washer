var app = getApp()
var param = {
  data: {
    indexBtn: '扫码',
    userInfo:{}
  },
  // 扫码
  scanCode: function () {
    console.log(this.data.userInfo);
    var that=this;
    wx.request({
          url: 'https://washer.mychaochao.cn/db/user.php',
          data: {
            sid: app.globalData.sid,
            cmd: 'get'
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': "PHPSESSID=" + app.globalData.sid
          },
          success: function (res1) {
            if(res1.data.mobile==null||res1.data.mobile==""){
              wx.showLoading({
                title: '请先进行注册',
              })
              setTimeout(function(){
                wx.hideLoading();
                wx.navigateTo({
                  url: '../login/login'
                })
              },1000)
            }else{
              that.wxScanCode();
            }
          }
        })
  },
  // 扫码接口
  wxScanCode:function(){
    wx.scanCode({
      success: function (res) {
        wx.request({
          url: 'https://washer.mychaochao.cn/db/socket.php',
          data: {
            sid: app.globalData.sid,
            cmd: 'get',
            num: res.result
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': "PHPSESSID=" + app.globalData.sid
          },
          success: function (res1) {
            if (res1.data.sockets.length == 0) {
              wx.showModal({
                title: '提示',
                content: '非法二维码！',
                showCancel: false
              })
            } else {
              wx.setStorageSync('washerId', res.result);
              wx.navigateTo({
                url: "../pattern/pattern?washerId=" + res.result
              })
            }
          }
        })
      }
    })
  },
  onLoad: function (data) {
    if (data.q) {
      var url = decodeURIComponent(data.q);// ‘https://washer.mychaochao.cn/db/aaa’, 其中aaa指定唯一值，整个字符串应该作为二维码编号
      console.log(decodeURIComponent(data.q));
      wx.navigateTo({
        url: "../pattern/pattern?washerId=" + url
      })
    }
    var that=this;
    app.getUserInfo(function(userInfo){
      that.setData({
        userInfo:userInfo
      })
      wx.setStorageSync('avatar', that.data.userInfo.avatarUrl);
    })
  }
}
Page(param)
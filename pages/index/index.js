var app = getApp()
var param = {
  data: {
    indexBtn: '扫码',
    userInfo:{}
  },
  // 扫码
  scanCode: function () {
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
            console.log(res1);
            if (res1.data.sockets.length == 0) {
              wx.showModal({
                title: '提示',
                content: '非法二维码！',
                showCancel: false
              })
            } else if(res1.data.sockets.length!=0) {
              wx.setStorageSync('washerId', res.result);
              wx.navigateTo({
                url: "../pattern/pattern?washerId=" + res.result
              })
            }else if(res1.data.sockets[0].status=="1"){
              wx.showModal({
                content: '洗衣机工作中。。。',
                title: '提示',
                showCancel: false,
                success: function () {
                  wx.switchTab({
                    url: '../index/index'
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  onLoad: function (data) {
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
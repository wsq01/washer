var app = getApp();
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
            console.log(res1);
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
  onLoad: function () {
    var that=this;
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
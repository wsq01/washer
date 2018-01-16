var app = getApp()
var param = {
  data: {
    indexBtn: '扫码',
    url: '',
    sid: '',
    num:'',  //洗衣机编码
    existQ:false
  },
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      
    })
    that.setData({
      url: app.globalData.url,
      sid: app.globalData.sid,
      exitQ: false
    })
    if (options.q) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1000
      })
      var q = decodeURIComponent(options.q);
      that.setData({
        num: q,
        existQ: true
      })
    }
  },
  // 扫码
  scanCode: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'user.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get'
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
        if (res.data.errno == "1") {
          if (res.data.mobile == null || res.data.mobile == "") {
            wx.showLoading({
              title: '请先进行注册',
            })
            setTimeout(function () {
              wx.hideLoading();
              wx.navigateTo({
                url: '../login/login'
              })
            }, 1000)
          } else {
            if(that.data.existQ){
              that.checkCode()
            }else{
              that.wxScanCode();
            }
          }
        } else {
          wx.showModal({
            title: '错误',
            content: '系统错误，请联系管理员！',
            showCancel: false
          })
        }
      }
    })
  },
  // 扫码接口
  wxScanCode: function () {
    var that = this;
    wx.scanCode({
      success: function (res) {
        console.log(res)
        that.setData({
          num:res.result
        })
        that.checkCode();
      }
    })
  },
  checkCode:function(){
    var that=this;
    wx.request({
      url: that.data.url + 'socket.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get',
        num: that.data.num
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res)
        if (res.data.sockets.length == 0) {
          wx.showModal({
            title: '提示',
            content: '非法二维码！',
            showCancel: false
          })
        } else if (res.data.sockets.length != 0) {
          wx.setStorageSync('washerId', that.data.num);
          wx.navigateTo({
            url: "../pattern/pattern?washerId=" + that.data.num
          })
        } else if (res.data.sockets[0].status == "1") {
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
  },
 
  onShow:function(){
    var that=this;
    if(that.data.existQ){
      that.scanCode();
    }
  },
  onHide:function(){
    this.setData({
      existQ:false
    })
  }
}
Page(param)
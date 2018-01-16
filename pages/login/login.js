var app = getApp();
var param = {
  data: {
    tel: '',
    captcha: '',
    userInfo: {},
    VerifyCode: '获取验证码',
    sendBtn: true,
    loginBtn: true,
    sid: '',
    url:''
  },
  bindTelInput: function (event) {
    if (event.detail.value == '') {
      this.setData({
        sendBtn: true
      })
    } else if ((/^1[34578]\d{9}$/.test(event.detail.value))) {
      wx.hideKeyboard();
      this.setData({
        tel: event.detail.value,
        sendBtn: false
      })
    }
  },
  bindCodeInput: function (event) {
    if(event.detail.value.length==4){
      wx.hideKeyboard();
      this.setData({
        captcha: event.detail.value
      })
    }
    
  },
  send_captcha: function () {
    var that = this;
    if (that.data.tel != null && that.data.tel != '') {
      wx.request({
        url: that.data.url+'sms.php',
        data: {
          cmd: 'send_captcha',
          mobile: this.data.tel
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': "PHPSESSID=" + app.globalData.sid
        },
        success: function (res) {
          var total_micro_second = 60 * 1000;
          //验证码倒计时
          count_down(that, total_micro_second);
          wx.showToast({
            title: '短信发送成功！',
            icon:'success',
            duration:1000
          })
        }
      })
    }
  },
  // 注册按钮
  login_submit: function () {
    var that = this;
    if (this.data.tel != '' && this.data.captcha != '') {
      wx.request({
        url: that.data.url+'user.php',
        data: {
          sid: app.globalData.sid,
          cmd: 'edit',
          name: that.data.userInfo.nickName,
          captcha: that.data.captcha,
          mobile: that.data.tel,
          city:that.data.userInfo.city
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': "PHPSESSID=" + app.globalData.sid
        },
        success: function (res) {
          console.log(res);
          if (res.data.errno == "-10005") {
            wx.showModal({
              title: '提示',
              content: '该手机已注册过！',
            })
          } else if(res.data.errno==-2){
            wx.showModal({
              title: '提示',
              content: '验证码错误',
              showCancel:false
            })
          }else if(res.data.errno==-3){
            wx.showModal({
              title: '提示',
              content: '未获取验证码！',
              showCancel: false
            })
          }
           else {
            wx.showLoading({
              title: '注册成功',
            })
            setTimeout(function () {
              wx.hideLoading();
              wx.switchTab({
                url: '../index/index'
              })
            }, 2000)
          }
        }
      })
    } else if(this.data.tel==''){
      wx.showModal({
        title: '提示',
        content: '手机号不正确',
        showCancel: false
      })
    }else if(this.data.captcha==''){
      wx.showModal({
        title: '提示',
        content: '请输入验证码',
        showCancel: false
      })
    }
  },
  // 更新用户信息
  updateUser: function () {
    var that = this;
    console.log(that.data.userInfo);
    wx.request({
      url: that.data.url+'user.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'edit',
        name: that.data.userInfo.nickName,
        mobile: that.data.tel,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
      }
    })
  },
  onLoad: function () {
    var that = this;
    that.setData({
      url:app.globalData.url,
      sid:app.globalData.sid
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  }
}
/* 毫秒级倒计时 */
function count_down(that, total_micro_second) {
  if (total_micro_second <= 0) {
    that.setData({
      VerifyCode: "重新发送",
      sendBtn: false
    });
    // timeout则跳出递归
    return;
  }
  // 渲染倒计时时钟
  that.setData({
    VerifyCode: date_format(total_micro_second) + " 秒",
    sendBtn: true
  });

  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 10;
    count_down(that, total_micro_second);
  }, 10)



}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;
  // 毫秒位，保留2位
  var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));

  return sec;
}

// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}
Page(param)
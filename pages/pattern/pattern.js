var app = getApp();
var param = {
  data: {
    price: '15.00', //价格
    pattern_time: 39,  //时间
    current: 0,
    selected: 1, //模式

    token: '',
    socketId: '',
    washerId: '',
    ID: '', //新添订单id
    sid: '',
    mac: '',
    did: '',
    address: '',
    channelID: '',
    time_pay: ''
  },
  toRight: function () {
    this.setData({
      current: 1
    })
  },
  toLeft: function () {
    this.setData({
      current: 0
    })
  },
  changeSwiper: function (e) {
    this.setData({
      current: e.detail.current
    })
  },
  selectItem1: function () {
    this.setData({
      selected: 1,
      pattern_time: 39
    })
  },
  selectItem2: function () {
    this.setData({
      selected: 2,
      pattern_time: 15
    })
  },
  selectItem3: function () {
    this.setData({
      selected: 3,
      pattern_time: 35
    })
  },
  selectItem4: function () {
    this.setData({
      selected: 4,
      pattern_time: 7
    })
  },
  selectItem5: function () {
    this.setData({
      selected: 5,
      pattern_time: 27
    })
  },
  selectItem6: function () {
    this.setData({
      selected: 6,
      pattern_time: 15
    })
  },
  // 模式选择确认
  toPay: function () {
    var that = this;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    that.device_detail();
  },
  // 查询设备状态
  device_detail: function () {
    var that = this;
    //获取token
    wx.request({
      url: 'https://washer.mychaochao.cn/db/gizwit.php',
      data: {
        cmd: 'get_token',
        product_key: 'f2b3ad83e27545af8e2e62fbbfcf6cb2',
        enterprise_id: 'c82feec27e5f4a2e94c23da4a4027cf0',
        enterprise_secret: 'd03ac997f4dd46a097f02edd7081b488',
        product_secret: '17c0ddf512a74b96bb69b84c3a68c969'
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.setData({
          token: res.data.token
        })
        wx.request({
          url: 'https://washer.mychaochao.cn/db/gizwit.php',
          data: {
            cmd: 'device_detail',
            product_key: '68badfdc59634329b3c4be931d7322cb',
            token: res.data.token,
            mac: that.data.mac
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': "PHPSESSID=" + that.data.sid
          },
          success: function (res) {
            if (res.data.re.is_online == false) {
              wx.hideToast();
              wx.showModal({
                content: '设备未开启，请联系管理员!',
                title: '提示',
                showCancel: false
              })
            } else if (res.data.re.is_online == true) {
              that.add_order();
            } else if (res.data.re.error_code == '5301') {
              wx.hideToast();
              wx.showModal({
                content: 'device not exist',
                title: '提示',
                showCancel: false
              })
            } else {
              wx.hideToast();
              wx.showModal({
                content: '系统错误,请联系工作人员！',
                title: '提示',
                showCancel: false
              })
            }
          }
        })
      }
    })
  },
  // 添加订单接口
  add_order: function () {
    var that = this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/order.php',
      data: {
        cmd: 'add_order',
        sid: that.data.sid,
        duration: that.data.pattern_time,
        socket: that.data.socketId,
        amount: that.data.price,
        mode: that.data.selected,
        addr: that.data.address,
        uid: wx.getStorageSync('uid')
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + that.data.sid
      },
      success: function (res) {
        wx.hideToast();
        that.setData({
          ID: res.data.id
        });
        wx.showActionSheet({
          itemList: ['余额支付', '微信支付'],
          success: function (res) {
            if(res.tapIndex==0){
              that.getUser();
            }else{
              that.resPayment();
            }
          },
          fail: function (res) {
            console.log(res.errMsg)
          }
        })
        // that.getUser()
        // that.resPayment();
        // that.confirm_pay();
      }
    })
  },
  // 余额支付
  editRecharge:function(){
    var that = this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/recharge.php',
      data: {
        sid: that.data.sid,
        cmd: 'edit',
        duration:that.data.pattern_time
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res);
        if(res.data.errno=="1"){
          that.confirm_pay();
        }
      }
    })
  },
  //  获取余额
  getUser: function () {
    var that = this;
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
        if(res.data.min=="0"||res.data.min<that.data.pattern_time){
          wx.showModal({
            content: '余额不足',
            showCancel:false
          })
        }else{
          that.editRecharge()
        }
      }
    })
  },
  //发起订单付款接口
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
        wx.hideToast();
        // 发起支付
        wx.requestPayment({
          'timeStamp': data.timeStamp,
          'nonceStr': data.nonceStr,
          'package': data.package,
          'signType': data.signType,
          'paySign': data.paySign,
          'success': function (res) {
            that.confirm_pay();
          }
        });
      }
    })
  },
  // 确认订单付款接口
  confirm_pay: function () {
    var that = this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/order.php',
      data: {
        cmd: 'confirm_pay',
        sid: that.data.sid,
        id: that.data.ID,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + that.data.sid
      },
      success: function (res) {
        console.log(res);
        var startTime = new Date();
        var start_time = that.formatDateTime(startTime);
        wx.setStorageSync('time_pay',startTime );
        that.setData({
          time_pay: start_time
        })
        //跳转页面
        wx.redirectTo({
          url: '../time/time?address=' + that.data.address + '&price=' + that.data.price + '&time_pay=' + that.data.time_pay + '&duringMs=' + that.data.pattern_time + '&did=' + that.data.did + '&token=' + that.data.token + '&channelID=' + that.data.channelID
        })
      }
    })
  },
  // 获取洗衣机id设置mac
  get_washer: function () {
    var that = this;
    wx.request({
      url: 'https://washer.mychaochao.cn/db/socket.php',
      data: {
        cmd: 'get',
        sid: that.data.sid,
        num: that.data.washerId
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + that.data.sid
      },
      success: function (res) {
        var status = res.data.sockets[0].status;
        if (status == "0") {
          var city = res.data.sockets[0].city;
          var school = res.data.sockets[0].school_name;
          var building = res.data.sockets[0].building_name;
          var floor = res.data.sockets[0].floor_name;
          var index = res.data.sockets[0].index;
          var socketId = res.data.sockets[0].id;
          var socketName = res.data.sockets[0].socketname;
          var address = school + building + floor + index + '号' + socketName;
          that.setData({
            price: res.data.sockets[0].price,
            address: address,
            socketId: socketId,
            channelID: res.data.sockets[0].index
          })
          var device = res.data.sockets[0].device; //洗衣机控制器ID
          // 获取洗衣机控制器
          wx.request({
            url: 'https://washer.mychaochao.cn/db/socket.php',
            data: {
              cmd: 'get_device',
              sid: that.data.sid,
              id: device
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': "PHPSESSID=" + that.data.sid
            },
            success: function (res) {
              if (res.data.devices.length == 0) {
                wx.showLoading({
                  title: '控制器错误！',
                })
                setTimeout(function () {
                  wx.hideLoading()
                  wx.switchTab({
                    url: '../index/index'
                  })
                }, 1500)
              } else {
                that.setData({
                  mac: res.data.devices[0].mac,
                  did: res.data.devices[0].did
                })
              }
            }
          })
        }
        else if (status == "1") {
          wx.showModal({
            content: '洗衣机工作中。。。',
            title: '提示',
            showCancel: false,
            success:function(){
              wx.switchTab({
                url: '../index/index'
              })
            }
          })
        } else {

        }
      }
    })
  },
  onLoad: function (option) {
    this.setData({
      sid: app.globalData.sid,
      washerId: option.washerId
    })
    this.get_washer();
  },
  formatDateTime: function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    var minute = date.getMinutes();
    var ms = date.getSeconds()
    minute = minute < 10 ? ('0' + minute) : minute;
    return y + '年' + m + '月' + d + '日 ' + h + ':' + minute + ':' + ms;
  }
}
Page(param)
var app = getApp();
var param = {
  data: {
    itemData: [{
      name: '标准洗',
      time: 39,
      money: '4.5',
      selectedItem: false
    }, {
      name: '快速洗',
      duration: 15,
      amount: '2',
      selectedItem: false
    }, {
      name: '轻柔洗',
      duration: 35,
      amount: '4',
      selectedItem: false
    }, {
      name: '单脱',
      duration: 7,
      amount: '1',
      selectedItem: false
    }, {
      name: '漂脱',
      duration: 27,
      amount: '3',
      selectedItem: false
    }, {
      name: '单洗',
      duration: 15,
      amount: '2',
      selectedItem: false
    }],
    price: '', //价格
    pattern_time: '',  //时间
    current: 0,
    selectedMode: '快速洗', //模式
    selected: 0,
    token: '',
    socketId: '',
    washerId: '',
    ID: '', //新添订单id
    sid: '',
    url: '',
    mac: '',
    did: '',
    mySchool: '',
    myAddr: '',
    channelID: '',
    time_pay: '',
    payType:0
  },
  onLoad: function (option) {
    this.setData({
      sid: app.globalData.sid,
      url: app.globalData.url,
      washerId: option.washerId
    })
    this.getMode();
    this.get_washer();
  },
  getMode:function(){
    var that=this;
    wx.request({
      url: that.data.url+'socket.php',
      method:'POST',
      data:{
        cmd:'get_mode',
        sid: app.globalData.sid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success:function(res){
        console.log(res);
        for(var i=0;i<res.data.modes.length;i++){
          res.data.modes[i].selectedItem=false;
          res.data.modes[i].amount = parseFloat(res.data.modes[i].amount)
        }
        that.setData({
          itemData:res.data.modes
        })
      }
    })
  },
  // 获取洗衣机id设置mac
  get_washer: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'socket.php',
      data: {
        cmd: 'get',
        sid: app.globalData.sid,
        num: that.data.washerId
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res)
        var status = res.data.sockets[0].status;
        if (status == "0") {
          var city = res.data.sockets[0].city;
          var school = res.data.sockets[0].school_name;
          var building = res.data.sockets[0].building_name;
          var floor = res.data.sockets[0].floor_name;
          var index = res.data.sockets[0].index;
          var socketId = res.data.sockets[0].id;
          var socketName = res.data.sockets[0].socketname;
          var mySchool = school;
          // var price = res.data.sockets[0].price;
          var myAddr = floor + index + '号' + socketName;
          var device = res.data.sockets[0].device; //洗衣机控制器ID
          // for (var i = 0; i < that.data.itemData.length; i++) {
          //   var setItem = "itemData[" + i + "].money";
          //   that.setData({
          //     [setItem]: price
          //   })
          // }
          that.setData({
            // price: res.data.sockets[0].price,
            myAddr: myAddr,
            mySchool: mySchool,
            socketId: socketId,
            channelID: res.data.sockets[0].index
          })
          // 获取洗衣机控制器
          wx.request({
            url: that.data.url + 'socket.php',
            data: {
              cmd: 'get_device',
              sid: app.globalData.sid,
              id: device
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': "PHPSESSID=" + app.globalData.sid
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
        }else if (status == "1") {
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
        } else {

        }
      }
    })
  },
  // 选择
  selected: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var time = e.currentTarget.dataset.time;
    var mode = e.currentTarget.dataset.mode;
    var money=e.currentTarget.dataset.money;
    console.log(e.currentTarget.dataset)
    for (var i = 0; i < this.data.itemData.length; i++) {
      if (that.data.itemData[i].selectedItem != false) {
        var setItem1 = "itemData[" + i + "].selectedItem";
        that.setData({
          [setItem1]: false
        })
      }
    }
    var setItem = "itemData[" + index + "].selectedItem";
    that.setData({
      [setItem]: true,
      pattern_time: time,
      selectedMode: mode,
      price:money,
      selected: index + 1
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
      url: that.data.url + 'gizwit.php',
      data: {
        cmd: 'get_token',
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res)
        that.setData({
          token: res.data.token
        })
        wx.request({
          url: that.data.url + 'gizwit.php',
          data: {
            cmd: 'device_detail',
            product_key: '68badfdc59634329b3c4be931d7322cb',
            token: that.data.token,
            mac: that.data.mac
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': "PHPSESSID=" + app.globalData.sid
          },
          success: function (res) {
            console.log(res);
            if (res.data.re.is_online == false) {
              wx.hideToast();
              wx.showModal({
                content: '设备未开启，请联系管理员!',
                title: '提示',
                showCancel: false
              })
            } else if (res.data.re.is_online == true) {
              wx.hideToast();
              wx.showActionSheet({
                itemList: ['余额支付', '微信支付'],
                success: function (res) {
                  if (res.tapIndex == 0) {
                    wx.showModal({
                      title: '提示',
                      content: '确定用余额进行支付吗？',
                      success: function (res) {
                        if (res.confirm) {
                          that.setData({
                            payType:0,
                            price:parseInt(that.data.pattern_time)
                          })
                          that.getUser();
                        } else if (res.cancel) {
                        }
                      }
                    })
                  } else if (res.tapIndex == 1) {
                    that.resPayment();
                  }
                },
                fail: function (res) {
                  console.log(res.errMsg)
                }
              })
            } else if (res.data.re.error_code == '5301') {
              wx.hideToast();
              wx.showModal({
                content: 'device not exist',
                title: '提示',
                showCancel: false
              })
            } else if (res.data.re.error_code == '5009') {
              wx.hideToast();
              wx.showModal({
                content: 'token invalid,请联系管理员！',
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
  // 余额支付
  editRecharge: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'recharge.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'edit',
        duration: that.data.pattern_time
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
        if (res.data.errno == "1") {
          that.add_order()
        } else if (res.data.errno == "-11") {
          wx.showModal({
            content: '余额不足',
            showCancel: false
          })
        }
      }
    })
  },
  //  获取余额
  getUser: function () {
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
        'Cookie': 'PHPSESSID=' + app.globalData.sid
      },
      success: function (res) {
        if (res.data.min == "0" || parseFloat(res.data.min) < parseFloat(that.data.pattern_time)) {
          wx.showModal({
            content: '余额不足',
            showCancel: false
          })
        } else {
          that.editRecharge()
        }
      }
    })
  },
  //发起订单付款接口
  resPayment: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'order.php',
      data: {
        openid: wx.getStorageSync('openid'),
        sid: app.globalData.sid,
        cmd: 'payJoinfee'
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
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
            that.setData({
              payType: 1
            })
            that.add_order();
          }
        });
      }
    })
  },
  // 添加订单接口
  add_order: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'order.php',
      data: {
        cmd: 'add_order',
        sid: app.globalData.sid,
        duration: that.data.pattern_time,
        socket: that.data.socketId,
        amount: that.data.price,
        paytype:that.data.paytype,
        mode: that.data.selected,
        addr: that.data.mySchool + that.data.myAddr,
        uid: wx.getStorageSync('uid')
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
        if(res.data.errno=='1'){
          wx.hideToast();
          that.setData({
            ID: res.data.id
          });
          that.confirm_pay();
        }
        
      }
    })
  },
  // 确认订单付款接口
  confirm_pay: function () {
    var that = this;
    wx.request({
      url: that.data.url + 'order.php',
      data: {
        cmd: 'confirm_pay',
        sid: app.globalData.sid,
        id: that.data.ID,
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        var startTime = new Date();
        var start_time = that.formatDateTime(startTime);
        wx.setStorageSync('time_pay', startTime);
        that.setData({
          time_pay: start_time
        })
        //跳转页面
        wx.redirectTo({
          url: '../time/time?myAddr=' + that.data.myAddr + '&mySchool=' + that.data.mySchool + '&price=' + that.data.price + '&time_pay=' + that.data.time_pay + '&duringMs=' + that.data.pattern_time + '&did=' + that.data.did + '&token=' + that.data.token + '&channelID=' + that.data.channelID + '&mode=' + that.data.selectedMode + '&payType=' + that.data.payType
        })
      }
    })
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
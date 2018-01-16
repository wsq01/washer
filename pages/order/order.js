var app = getApp();
Page({
  data: {
    /** 页面配置 */
    winWidth: 0,
    winHeight: 0,
    showItem:false,
    // tab切换  
    currentTab: 0,
    orders:[{
      addr:'',
      startime:'',
      mode:'',
      status:'',
      price:''
    }],
    url:'',
    sid:''
  },
  onLoad: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    that.setData({
      url:app.globalData.url,
      sid:app.globalData.sid,
    })
    /** 获取系统信息  */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
   that.getOrder();
  },
  getOrder:function(){
    var that=this;
    // 获取洗衣订单接口
    wx.request({
      url: that.data.url+'order.php',
      data: {
        sid: that.data.sid,
        cmd: 'get_orders',
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + that.data.sid
      },
      success: function (res) {
        console.log(res);
        if (res.data.errno == "1") {
          var order = res.data.orders;
          for (var i = 0; i < order.length; i++) {
            if (order[i].status == "0") {
              order[i].status = "未付款"
            } else if (order[i].status == "1") {
              order[i].status = "已付款"
            } else {
              order[i].status = "已完成"
            }
            if (order[i].mode == "2") {
              order[i].mode = "快速洗"
            } else if (order[i].mode == "1") {
              order[i].mode = "标准洗"
            } else if (order[i].mode == "3") {
              order[i].mode = "轻柔洗"
            } else if (order[i].mode == "4") {
              order[i].mode = "单脱"
            } else if (order[i].mode == "5") {
              order[i].mode = "漂脱"
            } else {
              order[i].mode = "单洗"
            }
            if(order[i].paytype=='0'){
              order[i].payType='余额支付';
            }else{
              order[i].payType = '微信支付';
            }
          }
          that.setData({
            orders: order,
            showItem:true
          })
        }
        wx.hideToast();
      }
    })
  },
  showTime:function(event){
    var orderId=event.currentTarget.dataset.orderId;
    if (event.currentTarget.dataset.status=="已付款"){
      wx.navigateTo({
        url: '../countDown/countDown?orderId='+orderId,
      })
    }
  
  },
  /** 滑动切换tab */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 点击tab切换 */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }
})  
var app = getApp();
Page({
  data: {
    /** 页面配置 */
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    orders:[{
      addr:'',
      startime:'',
      mode:'',
      status:'',
      price:''
    }]
  },
  onLoad: function () {
    var that = this;
    /** 获取系统信息  */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    // 获取洗衣订单接口
    wx.request({
      url: 'https://washer.mychaochao.cn/db/order.php',
      data: {
        sid: app.globalData.sid,
        cmd: 'get_orders',
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': "PHPSESSID=" + app.globalData.sid
      },
      success: function (res) {
        console.log(res);
        if(res.data.errno=="1"){   
        var order=res.data.orders;
        for(var i=0;i<order.length;i++){
          if(order[i].status=="0"){
            order[i].status="未付款"
          }else if(order[i].status=="1"){
            order[i].status="已付款"
          }else{
            order[i].status="已完成"
          }
          if(order[i].mode=="2"){
            order[i].mode="快速洗"
          }else if(order[i].mode=="1"){
            order[i].mode="标准洗"
          } else if (order[i].mode == "3"){
            order[i].mode="轻柔洗"
          } else if (order[i].mode == "4") {
            order[i].mode = "单脱"
          } else if (order[i].mode == "5") {
            order[i].mode = "漂脱"
          }else{
            order[i].mode = "单洗"
          }
        }
        that.setData({
          orders:order
        })
        }
      }
    })
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
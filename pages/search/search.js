var timer = require('../../utils/wxTimer.js');
var app = getApp();
var param = {
  data: {
    searchid: '',
    items: [],
    sid: '',
    url:'',
    socketsLength: false,
    clock: 0,
    wxTimerList: {},
    floor:'',
    addr:'',
    price:'',
    freeNum:'',
    busyNum:''
  },
  onPullDownRefresh: function () {
    this.onLoad();
    wx.stopPullDownRefresh()
  },
  onLoad: function (option) {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    this.setData({
      sid: app.globalData.sid,
      url:app.globalData.url,
      searchid: wx.getStorageSync('washerId')
    }),
    that.search();
  },
  ddd: function () {
    var that = this;
    that.data.items.forEach(function(t){
      if(t.diff&&t.diff!='00:00:00'){
        var wxTimer=new timer({
          beginTime:t.diff,
          name:t.socket+t.index,
          complete:function(){
            wxTimer.stop();      
            that.data.wxTimerList[t.socket + t.index]=null;
            console.log(that.data.wxTimerList[t.socket + t.index])
          }
        })
        wxTimer.start(that);
      }
    })
  },
  demo: function (floor) {
    var that = this;
    wx.request({
      url: that.data.url+'socket.php',
      data: {
        sid: that.data.sid,
        cmd: 'get_socket_status',
        floor: floor,
        customer:"0"
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res)
        var freeNum=0;
        var busyNum=0;
        for (var i = 0; i < res.data.lists.length; i++) {
          if (res.data.lists[i].diff) {
            var startTime = res.data.lists[i].starttime;
            var duringMs = Number(res.data.lists[i].duration * 60);
            var nowTime = res.data.lists[i].now;
            var countDown = startTime + duringMs - nowTime;
            if (countDown * 1000 <= 0) {
              countDown = 0
            }
            res.data.lists[i].countDown = countDown;
            res.data.lists[i].diff = that.date_format(countDown * 1000);
          }
          if (res.data.lists[i].socket_status == "0") {
            freeNum++;
            res.data.lists[i].socket_status = "空闲";
            res.data.lists[i].statusClass = "green";
          } else {
            busyNum++;
            res.data.lists[i].socket_status = "忙碌";
            res.data.lists[i].statusClass = "blue";
          }
        }
        that.setData({
          items: res.data.lists,
          freeNum:freeNum,
          busyNum:busyNum
        })
        wx.hideToast();
        that.ddd()
      }
    })
  },
  /* 格式化倒计时 */
  date_format: function (micro_second) {
    var that = this
    // 秒数  
    var second = Math.floor(micro_second / 1000);
    // 小时位  
    var hr = that.fill_zero_prefix(Math.floor(second / 3600));
    // 分钟位  
    var min = that.fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
    // 秒位  
    var sec = that.fill_zero_prefix(second % 60);
    return hr + ":" + min + ":" + sec;
  },
  /* 分秒位数补0 */
  fill_zero_prefix: function (num) {
    return num < 10 ? "0" + num : num
  },
  search: function () {
    var that = this;
    //获取当前洗衣机所在楼层
    wx.request({
      url: that.data.url+'socket.php',
      data: {
        sid: that.data.sid,
        cmd: 'get',
        num: that.data.searchid
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + that.data.sid
      },
      success: function (res) {
        console.log(res);
        if (res.data.errno == "1") {
          if (res.data.sockets.length == 0) {
            wx.hideToast();
            that.setData({
              socketsLength: true
            })
          } else {
            that.setData({
              socketsLength: false
            })
            var bName = res.data.sockets[0].building_name;
            var floor = res.data.sockets[0].floor;
            var fName=res.data.sockets[0].floor_name;
            var sName = res.data.sockets[0].school_name;
            var city = res.data.sockets[0].city;
            var price=res.data.sockets[0].price;
            var addr = sName + bName + fName;
            that.setData({
              floor:floor,
              addr:addr,
              price:price
            })
            that.demo(that.data.floor); 
          }
        }else{
          wx.showModal({
            title: '提示',
            content: '发生错误',
            showCancel:false
          })
        }
      }
    })
  }
}
Page(param)
var app = getApp();
var param = {
    data: {
        price: '5.00', //价格
        pattern_time: 1,  //时间
        current: 0,
        selected: 1,
        selection: 1,

        token: '',
        washerId: '',
        ID: '', //新添订单id
        sid: app.globalData.sid,
        mac: '',
        did: '',
        address: '',
        channelID: '',
        time_pay: '',
        mode: 1
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
            selected: 1
        })
    },
    selectItem2: function () {
        this.setData({
            selected: 2
        })
    },
    selectItem3: function () {
        this.setData({
            selected: 3
        })
    },
    selectItem4: function () {
        this.setData({
            selection: 1
        })
    },
    selectItem5: function () {
        this.setData({
            selection: 2
        })
    },
    selectItem6: function () {
        this.setData({
            selection: 3
        })
    },
    // 模式选择确认
    toPay: function () {
        var that = this;
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 5000
        })
        that.setData({
            mode: that.data.selection
        })
        that.device_detail();
        // that.control();
    },
    // 查询设备状态
    device_detail: function () {
        var that = this;
        //获取token
        wx.request({
            url: 'https://washer.mychaochao.cn/db/gizwit.php',
            data: {
                cmd: 'get_token',
                product_key: '68badfdc59634329b3c4be931d7322cb',
                enterprise_id: 'c82feec27e5f4a2e94c23da4a4027cf0',
                enterprise_secret: 'd03ac997f4dd46a097f02edd7081b488',
                product_secret: 'fc5b0892db8a458e8f2881dff5aeabb8'
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
                        console.log(res);
                        if (res.data.re.is_online == false) {
                            wx.showModal({
                                content: '设备未开启，请联系管理员!',
                                title: '提示',
                                showCancel: false
                            })
                        } else if (res.data.re.is_online == true) {
                            that.add_order();
                        }else if (res.data.re.error_code == '5301') {
                            wx.hideToast();
                            wx.showModal({
                                content: 'device not exist',
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
                socket: that.data.washerId,
                amount: that.data.price,
                mode: that.data.mode,
                addr: that.data.address,
                uid: wx.getStorageSync('uid')
            },
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': "PHPSESSID=" + that.data.sid
            },
            success: function (res) {
                console.log(res);
                that.setData({
                    ID: res.data.id
                });
                that.resPayment();
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
                        console.log(res);
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
                openid: wx.getStorageSync('openid')
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
                that.setData({
                    time_pay: start_time
                })
                //跳转页面
                wx.redirectTo({
                    url: '../time/time?address=' + that.data.address + '&price=' + that.data.price + '&time_pay=' + that.data.time_pay + '&duringMs=' + that.data.pattern_time + '&did=' + that.data.did + '&token=' + that.data.token + '&channelID=' + that.data.channelID,
                    success: function (res) {

                    }
                })
                // that.control();
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
                id: that.data.washerId
            },
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': "PHPSESSID=" + that.data.sid
            },
            success: function (res) {
                console.log(res);
                var city = res.data.sockets[0].city;
                var school = res.data.sockets[0].school;
                var building = res.data.sockets[0].building;
                var floor = res.data.sockets[0].floor;
                var index = res.data.sockets[0].index;
                var socketName = res.data.sockets[0].socketname;
                var address = '';
                wx.request({
                    url: 'https://washer.mychaochao.cn/db/school.php',
                    data: {
                        cmd: 'get',
                        sid: that.data.sid,
                        id: school
                    },
                    method: 'POST',
                    header: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': "PHPSESSID=" + that.data.sid
                    },
                    success: function (res) {
                        address += res.data.schools[0].name;
                        wx.request({
                            url: 'https://washer.mychaochao.cn/db/building.php',
                            data: {
                                cmd: 'get',
                                sid: that.data.sid,
                                id: building
                            },
                            method: 'POST',
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Cookie': "PHPSESSID=" + that.data.sid
                            },
                            success: function (res) {
                                address += res.data.buildings[0].name;
                                wx.request({
                                    url: 'https://washer.mychaochao.cn/db/floor.php',
                                    data: {
                                        cmd: 'get',
                                        sid: that.data.sid,
                                        id: floor
                                    },
                                    method: 'POST',
                                    header: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'Cookie': "PHPSESSID=" + that.data.sid
                                    },
                                    success: function (res) {
                                        address = address + res.data.floors[0].name + index + '号' + socketName;
                                        that.setData({
                                            address: address,
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
                that.setData({
                    price: res.data.sockets[0].price,
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
                        console.log(res);
                        if(res.data.devices.length==0){
                            wx.showLoading({
                            title: '控制器错误！',
                            })
                            setTimeout(function(){
                            wx.hideLoading()
                            wx.switchTab({
                              url: '../index/index'
                            })
                            },1500)
                        }else{
                        that.setData({
                            mac: res.data.devices[0].mac,
                            did: res.data.devices[0].did
                        })
                        }
                    }
                })
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
var app = getApp()
var money = 0
var b = 0
Page({
  data: {
    mymoney: 0,
    disabled: false,
    curNav: 1,
    curIndex: 0,
    cart: [],
    cartTotal: 0,
    navList: [{
      id: 1,
      chongzhi: '充￥300',
      song: '送￥124',
      money: "424"
    },
    {
      id: 2,
      chongzhi: '充￥100',
      song: '送￥50',
      money: "150"
    },
    {
      id: 3,
      chongzhi: '充￥50',
      song: '送￥20',
      money: "70"
    },
    {
      id: 4,
      chongzhi: '充￥20',
      song: '送￥5',
      money: "25"
    }
    ],
  },
  //充值金额分类渲染模块
  selectNav(event) {
    let id = event.target.dataset.id,
      index = parseInt(event.target.dataset.index);
    b = parseInt(event.target.dataset.money);
    self = this;
    this.setData({
      curNav: id,
      curIndex: index,
    })
  },
  //页面加载模块
  onLoad: function () {
    b = 424;
    this.setData({
      mymoney: money,
    })
  },
  buttonEventHandle: function (event) {
  },
  //去充值功能模块
  goblance: function (event) {
    money += b;
    this.setData({
      lockhidden: false,
      mymoney: money,
      sucmoney: b,
    })
  },
  confirm: function () {
    this.setData({
      lockhidden: true
    });
  }
})

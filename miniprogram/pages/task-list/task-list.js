// pages/detail-task/detal-task.js
const db = wx.cloud.database()
const teamCollection = db.collection('team')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showToolbar: false,
    boxStyle: 'box_b',
    up: true,
    down: false,
    teamName: '',
    memberNum: '',
    teamIntroduce: '',
    openId: '',
    teamId: '',
    userId: '',
    leaderId: '',
    taskList: [],
    task: [],
    userList: [],
    uhide: 0,
    currentTab: '',
    hiddenButton: true,
    taskListLength: 1,
    taskListLength2: 1,
    boxcolor: ["rgba(210, 210, 210, 1)", "#fc2100", "#fff659", "#27e530", "#5a97f6"],
    de: 0,
    nu: 0,
    type0: 0,
    type1: 0,
    finished: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('【task-list】【index界面传入参数】', options)
    this.setData({
      teamId: options.teamId,
      openId: options.openId,
      userId: options.userId
    })
    var that = this;
    db.collection('team').where({
      _id: options.teamId
    }).get({
      success(res) {
        that.setData({
          teamName: res.data[0].name,
          memberNum: res.data[0].userNum,
          teamIntroduce: res.data[0].introduce,
          taskList: res.data[0].taskList,
          userList: res.data[0].userList,
          taskListLength: (res.data[0].taskList.length) * 185 + 500,
          taskListLength2: (res.data[0].userList.length) * 70 + 500,
          unfinishTask: res.data[0].unfinishTask,
          leaderId: res.data[0].leader
        })
        

        console.log('【task-list】【获取指定的team信息】【获取成功】', res.data[0])
        if (that.data.taskList.length == 0) {
          that.setData({
            de: 1
          })
        }
        if (that.data.userList.length == 0) {
          that.setData({
            nu: 1
          })
        }
        if (that.data.leaderId == that.data.userId) {
          that.setData({
            hiddenButton: false
          })
        }
        for (var i = 0; i < that.data.taskList.length; i++) {
          db.collection('task').where({
            _id: that.data.taskList[i]
          }).get({
            success(res) {
              that.data.task.push(res.data[0])
              that.setData({
                task: that.data.task
              })
            }
          })
        }
        console.log('【task-list】【获取指定的task信息】【获取成功】', that.data.task)

        for (var i = 0; i < that.data.taskList.length; i++) {
          if (that.data.task[i].type == 0) {
            that.setData({
              type0: that.data.type0 + 1
            })
          }
          if (that.data.task[i].type == 1) {
            that.setData({
              type1: that.data.type1 + 1
            })
          }
        }
        that.setData({
          taskListLength: that.data.type0 * 140 + that.data.type1 * 80,
        })
        console.log('taskListLength', this.data.taskListLength)
      }
    })

  },
  /*** 滑动切换tab***/
  bindChange: function(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    })
    // console.log(e.detail.current)
  },
  /*** 点击tab切换***/
  swichNav: function(e) {
    var that = this;
    that.setData({
      currentTab: e.target.dataset.current
    })
    // console.log(e.detail.setdata.current)
  },
  bindMemberList: function() {
    wx.redirectTo({
      url: '/pages/number-list/number-list',
    })
  },
  longPressDelete: function(e) {
    var that = this;
    var task = that.data.task;
    var taskList = that.data.taskList;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    var taskIndexId = that.data.taskList[index];
    var finish = that.data.task[index].finish;
    if (this.data.userId == this.data.leaderId) {
      wx.showModal({
        title: '提示',
        content: '确定要删除此任务吗？',
        success: function(res) {
          if (res.confirm) {
            console.log('【task-list】【长按删除】【点击确定】', '索引为：', index, taskIndexId);
            db.collection('task').doc(taskIndexId).remove({
              success: console.log,
              fail: console.error
            })
            wx.cloud.callFunction({
              name: 'deleteTaskId',
              data: {
                taskId: task[index]._id,
                userList: task[index].userList
              },
            })
            task.splice(index, 1);
            taskList.splice(index, 1);
            that.setData({
              taskListLength: that.data.taskListLength - 180,
              task,
              taskList
            })
            db.collection('team').doc(that.data.teamId).update({
              data: {
                taskList: that.data.taskList,
                unfinishTask: finish ? that.data.unfinishTask : that.data.unfinishTask - 1
              }
            })
            if (that.data.taskList.length == 0) {
              that.setData({
                de: 1
              })
            }
          } else if (res.cancel) {
            console.log('【task-list】【长按删除】【点击取消】');
            return false;
          }

        }
      })
    }
  },
  onChangeShowState: function(event) {
    var that = this;
    // var toggleBtnVal = that.data.uhide;
    // var itemId = event.currenTarget.id;
    // if(toggleBtnVal == itemId){

    // }
  },
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      console.log('【task-list】【分享方式】【通过button分享】', res)
    }
    return {
      title: '邀请你加入' + this.data.teamName + '团队',
      path: '/pages/beInvited/beInvited?teamId=' + this.data.teamId + '&teamName=' + this.data.teamName,
      // imageUrl: '/images/share.png',
    }
  },
  addTask: function(res) {
    var that = this;
    if (this.data.currentTab) {
      if (res.from == 'button') {
        console.log('【task-list】【分享方式】【通过button分享】', res)
      }
      // return {
      //   title: '邀请你加入新团队',
      //   path: '/pages/beInvited/beInvited?teamId=' + this.data.teamId+'&teamName='+this.data.teamName,
      //   imageUrl: '/images/share.png',
      // }

    } else {
      wx.navigateTo({
        url: '/pages/create_task/create_task?teamId=' + that.data.teamId + '&openId=' + that.data.openId + '&userId=' + that.data.userId + '&teamName=' + that.data.teamName + '&unfinishTask=' + that.data.unfinishTask
      })
    }

  },
  bindTaskDetail: function(e) {
    var index = e.currentTarget.dataset.index;
    console.log(this.data.task[index]);
    var that = this;
    if (!that.data.task[index].type) {
      wx.navigateTo({
        url: '/pages/task/task?taskId=' + that.data.task[index]._id + '&teamName=' + that.data.teamName + '&userId=' + that.data.userId + '&leaderId=' + that.data.leaderId
      })
    } else {
      wx.navigateTo({
        url: '/pages/inform/inform?taskId=' + that.data.task[index]._id + '&teamName=' + that.data.teamName + '&userId=' + that.data.userId + '&leaderId=' + that.data.leaderId
      })
    }

  },
  onToggle: function() {
    this.setData({
      showToolbar: !this.data.showToolbar
    });
  },

  onAdd: function() {
    wx.navigateTo({
      url: '/pages/create_inform/create_inform?teamId=' + this.data.teamId + "&openId=" + this.data.openId + "&userId=" + this.data.userId + "&teamName=" + this.data.teamName + "&unfinishTask=" + this.data.unfinishTask
    });
  },

  onAddDigest: function() {
    wx.navigateTo({
      url: '/pages/create_task/create_task?teamId=' + this.data.teamId + "&openId=" + this.data.openId + "&userId=" + this.data.userId + "&teamName=" + this.data.teamName + "&unfinishTask=" + this.data.unfinishTask
    })
  },
  onFinish: function() {
    var that = this;
    that.setData({
      type0 : 0,
      type1 : 0
    })
    for (var i = 0; i < that.data.taskList.length; i++) {
      if (that.data.task[i].type == 0) {
        that.setData({
          type0: that.data.type0 + 1
        })
      }
      if (that.data.task[i].type == 1) {
        that.setData({
          type1: that.data.type1 + 1
        })
      }
    }
    that.setData({
      taskListLength: that.data.type0 * 150 + that.data.type1 * 90 + 600,
      finished: true
    })
  },
  onUnfinish: function() {
    var that = this;
    that.setData({
      type0: 0,
      type1: 0
    })
    for (var i = 0; i < that.data.taskList.length; i++) {
      if (that.data.task[i].finish == false) {
        if (that.data.task[i].type == 0) {
          that.setData({
            type0: that.data.type0 + 1
          })
        }
        if (that.data.task[i].type == 1) {
          that.setData({
            type1: that.data.type1 + 1
          })
        }
      }
    }

    that.setData({
      taskListLength: that.data.type0 * 150 + that.data.type1 * 90 + 600,
      finished: false
    })
  }
})
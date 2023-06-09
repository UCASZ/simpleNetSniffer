import {PubSub} from 'pubsub-js';

let websocket,
    lockReconnect = false;
let createWebSocket = (url) => {
    websocket = new WebSocket(url);
    console.log('ws connect')
    websocket.onopen = function () {
        console.log('ws open')
        lockReconnect = true
        //heartCheck.reset().start();
    };
    websocket.onerror = function () {
        console.log("try reconnect...")
        lockReconnect = false
        reconnect(url);
    };
    websocket.onclose = function (e) {
        //heartCheck.reset()
        console.log('ws closed: ' + e.code + ' ' + e.reason + ' ' + e.wasClean);
    };
    websocket.onmessage = function (event) {
        //console.log('onmessage....')
        lockReconnect = true;
        //event 为服务端传输的消息，在这里可以处理
        let data = event.data;//把获取到的消息处理成字典，方便后期使用
        PubSub.publish('message', data); //发布接收到的消息 'message' 为发布消息的名称，data 为发布的消息
    };
};

let reconnect = (url) => {
    if (lockReconnect) return;
    // 没连接上会一直重连，设置延迟避免请求过多
    setTimeout(function () {
        createWebSocket(url);
        lockReconnect = false;
    }, 4000);
};
let heartCheck = {
    timeout: 6000, // 6秒
    timeoutObj: null,
    reset: function () {
        clearInterval(this.timeoutObj);
        return this;
    },
    start: function () {
        this.timeoutObj = setInterval(function () {
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            // onmessage拿到返回的心跳就说明连接正常
            websocket.send('HeartBeat');
        }, this.timeout);
    },
};
// 关闭连接
let closeWebSocket = () => {
    websocket && websocket.close();
};
export {websocket, createWebSocket, closeWebSocket};

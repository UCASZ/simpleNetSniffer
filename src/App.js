import './App.css'
import {getEthernets} from './utils/getEthernets'
import {listen} from './utils/listen'
import {stopListen} from './utils/stopListen'
import {createWebSocket,closeWebSocket} from './utils/websocket'
import {useEffect, useState} from 'react'
import {PubSub} from "pubsub-js";

var Protocols = []
/*const Protocols = [
    {protocalName: "TCP", dstAddr: "192.168.109.1", srcAddr: "20.193.33.2", dstPort: 80, srcPort: 8000, key: 0},
    {protocalName: "TCP", dstAddr: "192.168.109.2", srcAddr: "20.193.33.2", dstPort: 80, srcPort: 8000, key: 1},
    {protocalName: "TCP", dstAddr: "192.168.109.3", srcAddr: "20.193.33.2", dstPort: 80, srcPort: 8000, key: 2},
    {protocalName: "TCP", dstAddr: "192.168.109.9", srcAddr: "20.193.33.2", dstPort: 80, srcPort: 8000, key: 3},
    {protocalName: "UDP", dstAddr: "192.168.109.134", srcAddr: "20.193.99.2", dstPort: 80, srcPort: 8000, key: 4},
    {protocalName: "TCP", dstAddr: "192.168.109.5", srcAddr: "20.193.33.2", dstPort: 80, srcPort: 8000, key: 5}
];*/

function ProtocolRow({Protocol}) {
    var color, data, url = 'about:blank'
    switch (Protocol.protocalName) {
        case 'TCP':
            color = 'blue'
            break
        case 'UDP':
            color = 'green'
            break
        default:
            color = 'black'
    }
    if (Protocol.data == null) {
        data = ""
    } else {
        //console.log(Protocol.data.data)
        url = "https://gchq.github.io/CyberChef/#recipe=From_Hex('Auto')&input=" + encodeURIComponent(btoa(Protocol.data.data.toString()))
        data = 'Hex Data'
    }

    return (
        <tr>
            <td>{<span style={{color: color}}>{Protocol.protocalName}</span>}</td>
            <td>{<span style={{color: color}}>{Protocol.dstAddr}</span>}</td>
            <td>{<span style={{color: color}}>{Protocol.srcAddr}</span>}</td>
            <td>{<span style={{color: color}}>{Protocol.dstPort}</span>}</td>
            <td>{<span style={{color: color}}>{Protocol.srcPort}</span>}</td>
            <td>{<a href={url}>{data}</a>}</td>
        </tr>
    )
}

function ProtocolTable({Protocols, filterText}) {
    const rows = []
    const arr = filterText.split(";");
    const protocol = arr[0] === undefined? "": arr[0]
    const dstAddr = arr[1] === undefined? "": arr[1]
    const srcAddr = arr[2] === undefined? "": arr[2]
    const dstPort = arr[3] === undefined? "": arr[3]
    const srcPort = arr[4] === undefined? "": arr[4]

    Protocols.forEach((Protocol) => {
        if (Protocol.dstPort === undefined || Protocol.srcPort === undefined) {
            Protocol.dstPort = ""
            Protocol.srcPort = ""
        }
        if (
            Protocol.protocalName.toLowerCase().indexOf(protocol.toLowerCase()) === -1 ||
            Protocol.dstAddr.toLowerCase().indexOf(dstAddr.toLowerCase()) === -1 ||
            Protocol.srcAddr.toLowerCase().indexOf(srcAddr.toLowerCase()) === -1 ||
            Protocol.dstPort.toString().toLowerCase().indexOf(dstPort.toLowerCase()) === -1 ||
            Protocol.srcPort.toString().toLowerCase().indexOf(srcPort.toLowerCase()) === -1
        ) {
            return
        }
        rows.push(
            <ProtocolRow
                Protocol={Protocol}
                key={Protocol.key}/>
        )
    })

    return (
        <table>
            <thead>
            <tr>
                <th>Protocol Name</th>
                <th>Destination Address</th>
                <th>Source Address</th>
                <th>Destination Port</th>
                <th>Source Port</th>
                <th>Data</th>
            </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    )
}

function SearchBar({
                       filterText,
                       onFilterTextChange
                   }) {
    return (
        <form className="search-box">
                <input
                    type="text"
                    value={filterText} placeholder="search... (Example: TCP;192.168.8.1;127.0.0.1;80;8000)"
                    className="form-control"
                    onChange={(e) => onFilterTextChange(e.target.value)}/>
        </form>
    )
}

function App() {

    useEffect(() => {
        let url="ws://localhost:3002";//服务端连接的url
        createWebSocket(url)
        let messageSocket=null;
        messageSocket = PubSub.subscribe('message',getMsg)
        //在组件卸载的时候，关闭连接
        return ()=>{
            PubSub.unsubscribe(messageSocket);
            closeWebSocket();
        }
    }, [])

    const getMsg=(topic, message)=>{
        const data = JSON.parse(message)
        Protocols.push(data)
        //console.log(data)
    }

    function clickGetEthernets() {
        getEthernets().then(ethernets => {
            var etherlist = document.getElementById("etherlist")
            while (etherlist.firstChild) {
                etherlist.removeChild(etherlist.firstChild)
            }
            ethernets.map(ethernet => {
                var option = document.createElement("option")
                option.setAttribute("value", ethernet)
                etherlist.appendChild(option)
            })
        })
    }

    function clickListening() {
        if (window.isListening === undefined) {
            var ethernet = document.getElementById('ethernet').value
            if (ethernet === "") {
                alert("请输入网卡名称！")
            } else {
                setValue('停止监听')
                window.isListening = true
                listen(ethernet).then()
            }
        } else {
            setValue('开始监听')
            window.isListening = undefined
            stopListen().then()
        }
    }

    const [filterText, setFilterText] = useState('')
    const [value, setValue] = useState('开始监听')
    //const [refresh, setRefresh] = useState(Array(5000).fill(null));

    return (
        <div className="App">
            <h1>简单的网络嗅弹器</h1>
            <input id="ethernet" type="text" list="etherlist" placeholder="请选择监听的网卡" className="form-control"
                   onClick={clickGetEthernets}></input>
            <datalist id="etherlist"></datalist>
            <button id="listening" onClick={clickListening} className="btn btn-primary">{value}</button>
            <SearchBar
                filterText={filterText}
                onFilterTextChange={setFilterText}/>
            <ProtocolTable
                Protocols={Protocols}
                filterText={filterText}/>
        </div>
    )
}

export default App

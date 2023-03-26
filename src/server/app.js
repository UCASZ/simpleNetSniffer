const express = require('express')
const os = require('os')
const pcap = require('pcap')
const WebSocket = require('ws')
const cors = require('cors')

var bodyParser = require('body-parser')

const app = express()
const port = 3001
const wsport = 3002
const wss = new WebSocket.Server({ port: wsport })
var pcap_session = null
var k = 0

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

// Deliver data through wss
function broadcastData(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data))
        }
    })
}

// Show all ethernets on the OS
app.get('/ethernets', (req, res) => {
    const interfaces = os.networkInterfaces()
    res.json(Object.keys(interfaces))
})

// Listening...
// To listen the ethernet, please type this command first: sudo setcap 'cap_net_raw,cap_net_admin+eip' $(readlink -f $(which node))
app.post('/listening', (req, res) => {
    let deviceName = req.body.ethernet
    var ip, tcp
    var protocalName, dstAddr, srcAddr, dstPort = undefined, srcPort = undefined, data = undefined
    pcap_session = pcap.createSession(deviceName)
    pcap_session.on('packet', (raw_packet) => {
        var packet = pcap.decode.packet(raw_packet);
        ip = packet.payload.payload;
        tcp = ip.payload;
        if (tcp != undefined) {
            protocalName = tcp.constructor.name
            dstAddr = ip.daddr + ""
            srcAddr = ip.saddr + ""
            dstPort = tcp.dport
            srcPort = tcp.sport
            data = tcp.data
        } else {
            protocalName = ip.constructor.name
            dstAddr = (ip.target_pa.addr + "").replaceAll(',', '.')
            srcAddr = (ip.sender_pa.addr + "").replaceAll(',', '.')
            data = undefined
        }
        //console.log(protocalName, dstAddr, srcAddr, dstPort, srcPort)
        const jsonData = {protocalName: protocalName, dstAddr: dstAddr, srcAddr: srcAddr, dstPort: dstPort, srcPort: srcPort, data: data, key: k}
        k += 1
        broadcastData(jsonData)
    })
})

// Stop listening.
app.get('/stop', (req, res) => {
    if (pcap_session != null) {
        pcap_session.close()
        pcap_session = null
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`Wss server listening on port ${wsport}`)
})

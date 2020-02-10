const conn = new WebSocket('ws://localhost:9000');
        
conn.addEventListener('open', () => {
    console.log('Connection established');
    const msg = JSON.stringify({
        type:'show-sessions'
    });
    conn.send(msg);
});

conn.addEventListener('message', event => {
    console.log('Received message', event.data);
    const data = JSON.parse(event.data);
    const games = document.getElementById('games');
    if (data.type === 'no-sessions') {
        games.innerHTML += "<tr><td rowspan='2'>현재 열린 방이 없습니다.</td><tr>";
    } else {
        const sessionId = /(?<=\id\"\:\").+(?=\"\,\"n)/.exec(data.content);
        const sessionName = /(?<=\e\"\:\").+(?=\"\,\"c)/.exec(data.content);
        games.innerHTML += '<tr><td>' + sessionName 
                        + '</td><td><input type="button" value="입장" onclick="location.href='
                        + "'playground.html#" + sessionId + "'" + '">';
    }
})

function createId(len = 6, chars = 'abcdefghjkmnopqrstwxyz0123456789')
{
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function send(data)
{
    const msg = JSON.stringify(data);
    console.log(`Sending message ${msg}`);
    conn.send(msg);
}

// show modal
document.getElementById('new').onclick = function() {
    document.getElementById('modal').style.display = "block";
};

// hide modal
document.getElementsByClassName("close")[0].onclick = function() {
    document.getElementById('modal').style.display = "none";
}

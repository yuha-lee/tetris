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
    if (data.content === '[]') {
        games.innerHTML += '현재 열린 방이 없습니다.';
    } else {
        games.innerHTML += data.content;
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

function initSession()
{
    const sessionId = createId();
    const sessionName = document.getElementById('sessionName').value;
    // console.log(sessionName);
    // const state = this.localTetris.serialize();
    // if (sessionId) {
    //     this.send({
    //         type: 'join-session',
    //         id: sessionId,
    //         // state,
    //     });
    // } else {
        this.send({
            type: 'create-session',
            id: sessionId,
            name: sessionName,
            // state,
        });
    // }
    location.href = 'playground.html#' + sessionId;
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

// document.getElementById('create').onclick = function() {
//     initSession();
// }

document.getElementById('join').onclick = function() {
    location.href = 'playground.html';
}


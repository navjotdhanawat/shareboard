module.exports = function (server) {
    var io = require('socket.io').listen(server);
    var cPushArray = new Array();
    var cStep = -1;
    var points = [];

    function cPush(dataUrl) {
        cStep++;
        if (cStep < cPushArray.length) {
            cPushArray.length = cStep;
        }
        cPushArray.push(dataUrl);
    }

    shareBoard = io.of('/shareBoard').on('connection', function (socket) {

        socket.on('shareBoard refresh', function (data) {
            shareBoard.emit('shareBoard savedImg', { savedImg: cPushArray[cStep] });
        });

        socket.on('shareBoard points', function (data) {
            points.push(data);
            shareBoard.emit('shareBoard points', data);
        });

        socket.on('shareBoard clear', function (data) {
            shareBoard.emit('shareBoard clear', data);
        });

        socket.on('shareBoard undo', function (data) {

            if (cStep > 0) {
                cStep--;
                shareBoard.emit('shareBoard undo', { undoImg: cPushArray[cStep] });
            } else {
                cStep = -1;
                shareBoard.emit('shareBoard clear', data);
            }
        });

        socket.on('shareBoard redo', function (data) {
            if (cStep < cPushArray.length - 1) {
                cStep++;
                shareBoard.emit('shareBoard redo', { redoImg: cPushArray[cStep] });
            }
        });

        socket.on('shareBoard push', function (data) {
            cPush(data.dataUrl);
        });
    });
}
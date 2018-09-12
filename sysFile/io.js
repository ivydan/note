const fs = require('fs');

function resetData(data, type, lineId) {
    const randomData = new Date();
    data.children && data.children.map(v => {
        if (v.id === lineId) {
            data.children.push({
                "title": type ? `new folder ${randomData.getMonth()}` : `new file ${randomData.getMonth()}`,
                "id": randomData.getTime(),
                "type": type ? 1 : 2,
                "dateStr": randomData.getMonth() + '-' + randomData.getDate(),
                "children": []
            })
        } else {
            resetData(v, type, lineId);
        }
    });
}

module.exports = {
    ioAddFolder: function(data, type, id){
        resetData(data, type, id);
        return data;
    },
    ioChangeContent: (id, content) => {
        const data = JSON.parse(fs.readFileSync( './sysFile/fileList.json' ));
        data[id] = content;
        return data;
    },
    ioChangeTitle: (id, title) => {
        const data = JSON.parse(fs.readFileSync( './sysFile/menuList.json' ));
        function changeTitle(data){
            data.children && data.children.map(v => {
                if (v.id === id) {
                    v.title = title
                }else{
                    changeTitle(v);
                }
            })
        }
        changeTitle(data);
        return data
    }
}
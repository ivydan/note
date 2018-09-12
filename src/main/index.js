/*
 * @Author: JuDandan 
 * @Date: 2018-09-03 10:37:08 
 * @Last Modified by: JuDandan
 * @Last Modified time: 2018-09-12 14:39:47
 */

import React, { Component } from 'react';
import Cls from 'classnames';
import _ from 'lodash';
import RichEditor from 'components/RichEditor';
import './index.less';

const remote = window.require('electron').remote;
const ipc = window.require('electron').ipcRenderer

// const selection = window.getSelection();
// const range = selection.getRangeAt(); //拖蓝

// selection 对象还有两个重要的方法， addRange 和 removeAllRanges。
// 分别用于向当前选取添加一个 range 对象和 删除所有 range 对象

// startContainer: range 范围的起始节点。
// endContainer: range 范围的结束节点
// startOffset: range 起点位置的偏移量。
// endOffset: range 终点位置的偏移量。
// commonAncestorContainer: 返回包含 startContainer 和 endContainer 的最深的节点。
// collapsed: 返回一个用于判断 Range 起始位置和终止位置是否相同的布尔值。

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            currentRenderData: {},  //当前菜单渲染列表
            backId: 0,              //回退使用ID
            currentFile: {},        //选中文本
            currentFileId: "10001", //当前选中项ID
            currentFileTitle: "",   //选中文本标题
        }

        _.bindAll(this,
            "_handleInsterImage",
            "_handleContextMenuLeft",
            "_handleBoldText",
            "_handleChangeTitle",
            "_handleOnSave",
            "_handleBlurTitle",
            "_handleCopyText",
            "_handleOnBlurEditor");

    }

    componentWillMount() {

    }

    // 子列表
    _handleRenderChildrenList(type, record, backId) {
        if (type === 1 && record.children.length) {
            let firstChild = record.children[0];
            this.setState({
                currentRenderData: record,
                backId: backId,
                currentFileId: firstChild.id || 0,
                currentFile: firstChild.type === 2 ? firstChild : {},
                currentFileTitle: firstChild.title
            })
        } else if (type === 2) {
            this.setState({
                currentFile: record,
                currentFileTitle: record.title,
                currentFileId: record.id || 0
            })
        }
    }

    // 渲染列表
    _handleRenderList() {
        let { currentRenderData, currentFileId } = this.state;
        let { children = [], id } = currentRenderData;
        return children.map(v => {
            let fileTitle = Cls({
                'file-title': true,
                'title-sign': v.id == currentFileId
            })
            return <div
                key={"FILETITLE" + v.id}
                datacode={v.id}
                datatype={v.type}
                onClick={this._handleRenderChildrenList.bind(this, v.type, v, id)}
                className={fileTitle}
            >
                <span className="file-icon">{v.type === 1 ? '☁' : '❉'}</span>
                <span>{v.title}</span>
                <span className="title-date">{v.dateStr}</span>
            </div>
        })
    }

    componentDidMount() {
        const self = this;
        ipc.on('event-left-list', function (event, list, newAllNoteData) {
            console.log(list);
            const { currentFileId, allNoteData } = self.state;
            let currentFile = {};
            let currentRenderData = list;
            function searchData(data){
                data.children && data.children.map(v => {
                    if(v.id === currentFileId){
                        currentFile = v;
                        currentRenderData = data;
                    }else{
                        searchData(v);
                    }
                })
            }
            searchData(list);
            self.setState({
                ...self.state,
                allNoteData: newAllNoteData ? newAllNoteData : allNoteData ,
                data: list,
                currentRenderData,
                currentFile,
                currentFileTitle: currentFile.title
            })
        });
    }

    // 返回
    _handleBack(data, newBackId) {
        let { backId } = this.state;
        if (data.id === backId) {
            this.setState({
                currentRenderData: data,
                currentFileId: data.children[0] && data.children[0].id || 0,
                backId: newBackId || 0,
                currentFile: {}
            });
            return false;
        } else {
            if (data.children && data.children.length) {
                data.children.map(v => {
                    this._handleBack(v, data.id);
                })
            }
        }
    }

    _handleInsterImage() {
        this.restoreRange();
        document.execCommand('insertImage', true, '/src/main/111.jpg');
    }

    _handleBoldText() {
        this.restoreRange();
        document.execCommand('bold', true);
    }

    _handleCopyText(e) {
        this.restoreRange();
        document.execCommand('copy', true);
    }

    restoreRange() {
        if (this.currentSelection) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            const range = document.createRange();
            range.setStart(this.currentSelection.startContainer, this.currentSelection.startOffset);
            range.setEnd(this.currentSelection.endContainer, this.currentSelection.endOffset);
            // 向选区中添加一个区域
            selection.addRange(range);
        }
    }

    _handleOnBlurEditor() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0); //拖蓝
        this.currentSelection = {
            "startContainer": range.startContainer,
            "startOffset": range.startOffset,
            "endContainer": range.endContainer,
            "endOffset": range.endOffset
        }
    }

    // 菜单右键
    _handleContextMenuLeft(event) {
        debugger;
        const { currentRenderData, currentFileId } = this.state;
        ipc.send('left-context-menu', currentRenderData.id === '10001', currentFileId )
    }

    //更改文件title
    _handleChangeTitle(e){
        this.setState({
            currentFileTitle: e.target.value
        })
    }
    //更新文件标题
    _handleBlurTitle(){
        const { currentFileId, currentFileTitle } = this.state;
        ipc.send('change-file-title', currentFileId, currentFileTitle);
    }

    //保存文件
    _handleOnSave(data){
        const { currentFileId } = this.state;
        ipc.send('change-file-content', currentFileId, data);
    }

    render() {
        let { data, currentFile, currentFileTitle, currentFileId, allNoteData } = this.state;
        return <div className="note-main">
            <div className="content-left">
                <div className="list-title" >
                    <span className="back" title="返回上一级" onClick={this._handleBack.bind(this, data)}>←</span>
                    <span className="other" title="添加" onClick={function () {
                        // 告诉主进程在单击示例按钮时显示菜单
                        ipc.send('show-context-menu');
                    }}>☰</span>
                </div>
                <div className="menu" onContextMenu={this._handleContextMenuLeft}>
                    {this._handleRenderList()}
                </div>
            </div>
            <div className="content-right">
                {currentFile.type === 2 ? <div>
                    <div className="right-title" >
                        <input className="common-edit-input" 
                            type="text" 
                            onChange={this._handleChangeTitle}
                            onBlur={this._handleBlurTitle}
                            value={currentFileTitle}/>
                    </div>
                    <RichEditor 
                        data={allNoteData[currentFileId]} 
                        onSave={this._handleOnSave} />
                </div> : <div className="tips" >
                        请选择文件
                </div>}
            </div>
        </div>
    }
}

export default Main;
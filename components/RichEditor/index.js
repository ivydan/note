/*
 * @Author: JuDandan 
 * @Date: 2018-09-03 10:37:08 
 * @Last Modified by: JuDandan
 * @Last Modified time: 2018-09-12 14:19:23
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './index.less';

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



class RichEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editData: ''
        }

        _.bindAll(this,
            "_handleInsterImage",
            "_handleOnInputEditor",
            "_handleCopyText",
            "_handleUploadImg",
            "_handleFormatText",
            "_handleFormatTextSize",
            "_handleOnBlurEditor");

    }

    componentWillMount() {
        this.setState({
            editData: this.props.data
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({
                editData: nextProps.data
            })
        }
    }

    componentDidMount() {

    }

    _handleInsterImage() {
        this.restoreRange();
        document.execCommand('insertImage', true, '/src/main/111.jpg');
    }

    _handleFormatText(type){
        this.restoreRange();
        document.execCommand(type, true);
    }

    _handleFormatTextSize(s){
        this.restoreRange();
        document.execCommand('FontSize', true, s);
    }

    _handleCopyText(e) {
        this.restoreRange();
        document.execCommand('copy', true);
    }

    _handleUploadImg(e) {
        console.log(e.target.files)
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
            "endOffset": range.endOffset,
            "anchorNode": selection.anchorNode,
            "anchorOffset": selection.anchorOffset,
            "range": range
        };
        this.props.onSave(this.state.editData);
    }

    _handleOnInputEditor(e) {
        this.setState({
            editData: e.target.innerHTML
        }, function () {
            this.moveToOriginSite();
        });
    }

    moveToOriginSite() {
        //焦点只能停留下结尾
        // const selection = window.getSelection();
        // selection.selectAllChildren(this.refs['editContent']);
        // selection.collapseToEnd();

        //焦点获取不准确，焦点存在于行尾
        // let srcObj = document.querySelector('#editContent');
        // let selection = window.getSelection();
        // let range = document.createRange();
        // range.selectNodeContents(srcObj);
        // selection.removeAllRanges();
        // selection.addRange(range);
        // range.setStart(srcObj, 1);
        // range.setEnd(srcObj, 1);
    }

    shouldComponentUpdate(nextProps, nextState){
        return nextState.editData !== ReactDOM.findDOMNode(this.refs.editContent).innerHTML;
    }

    render() {
        const { editData } = this.state;
        return <div className="star-rich-editor">
            <div className="o-editor">
                <div className="editor-operate">
                    {/* <span onClick={this._handleInsterImage}>
                        图片
                    </span> */}
                    <span onClick={() => {
                        this.props.onSave(this.state.editData);
                    }}>
                        Save
                    </span>
                    <span onClick={this._handleCopyText}>
                        Copy
                    </span>
                    <span onClick={this._handleFormatText.bind(this, 'bold')}>
                        B
                    </span>
                    <span onClick={this._handleFormatText.bind(this, 'italic')}>
                        I
                    </span>
                    <span onClick={this._handleFormatText.bind(this, 'underline')}>
                        U
                    </span>
                    <span onClick={this._handleFormatText.bind(this, 'InsertOrderedList')}>
                        OL
                    </span>
                    <span onClick={this._handleFormatText.bind(this, 'InsertUnorderedList')}>
                        UL
                    </span>
                    
                    {/* <span>
                        <input type="file" id="upLoadFile" onChange={this._handleUploadImg}/>
                    </span> */}
                </div>
                <div
                    ref="editContent"
                    id="editContent"
                    onBlur={this._handleOnBlurEditor}
                    onInput={this._handleOnInputEditor}
                    className="editor-content"
                    dangerouslySetInnerHTML={{ __html: editData }}
                    contentEditable="true">
                </div>
            </div>
        </div>
    }
}

export default RichEditor;
import React, { PureComponent } from 'react';
import MessageForm from './../../components/Messageform/Messageform';
import {connect} from 'react-redux';
import * as actions from '../../store/actions'

import EmojiViewer from '../EmojiViewer/EmojiViewer'

import workerCode from '../sharedWorker';

import styles from './styles.module.css';

import {getCookie} from '../cookie'



class AddMessage extends PureComponent {
    state = {
        messageId: 0,
        value: '',
        showEmojiViewer: false,
        worker: this.getSharedWorker()
    };

    getSharedWorker () {
        const workerFile = new Blob([`(${workerCode})(self)`], {type: 'text/javascript'});
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', (event) => {
                const worker = new SharedWorker(event.target.result);
                worker.port.start();
                window.addEventListener('beforeunload', () => {
                    worker.port.postMessage('disconnect');
                });
                res(worker);
            });
            reader.addEventListener('error', rej);
            reader.readAsDataURL(workerFile);
        });
    }


    handleChange(event) {
        this.setState({value: event.target.value}) 
    };


    readFile(file) {
        let fileReader = new FileReader();

        return new Promise((resolve, reject) => {
                fileReader.onload = e => {
                        let dataURI = e.target.result;
                        resolve(dataURI);
                }
                fileReader.onerror = () => reject('Ошибка чтения файла');
                fileReader.readAsDataURL(file); 
        })
    }; 


    handleSubmit(event) {
        event.preventDefault();
        let userId = getCookie('userID');

        let req = {
            userId: userId,
            txt: this.state.value,
            chatId: this.props.match.params.chat_id,
            reqData: 'post_message'
        }

        this.state.worker.then((worker) => {
            worker.port.postMessage(req);
        });

        this.props.AddMessage(this.state.messageId, this.state.value, 'Me', 63, 'text', null);
        this.setState({value: ''}); 
        this.setState({messageId: this.state.messageId+1});     
    };

    fileUpload(event) {
        return new Promise((resolve, reject) => {
            event.preventDefault();
            let reader = new FileReader();
            let file = event.target.files[0];
            reader.readAsDataURL(file);

            let extension = file.name.split('.').pop().toLowerCase();
            if (extension === 'png' || extension === 'jpg') {
                this.readFile(file).then( function(resultic) {
                    resolve(resultic); 
                });
            }
            else {
                resolve(file.name);
            }
        })
    };


    handleFileUpload(event) {
        this.fileUpload(event).then((result) => {
            if (result.length > 1000) {
                this.props.AddMessage(this.state.messageId, '', 'Me', 63, 'img', result);
                this.setState({messageId: this.state.messageId+1}); 
            }
            else {
                this.props.AddMessage(this.state.messageId, result, 'Me', 63, 'text', null);
                this.setState({messageId: this.state.messageId+1}); 
            }
        });
    };

    geoposition() {
        function error() {
            alert('Error: Position hasn`t been detected');
        };

        function getPosition (opts) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, error, opts);
            });
        };
        return getPosition();
    };


    handleGeoposition() {
        this.geoposition().then(result => {
        this.props.AddMessage(this.state.messageId, 'My latitude is ' + result.coords.latitude, 'Me', 63, null, null)            
        this.setState({messageId: this.state.messageId+1});
    })};


    handleOpenEmojiViewer() {
        this.setState({showEmojiViewer: !this.state.showEmojiViewer})
    };


    handleEmojiClick = (emojiCode) => {
        this.setState({value: this.state.value + '::' + emojiCode + '::'}) 
    };



    render() {
        return (
            <div id={styles['AddMessage-div']}>
                {this.state.showEmojiViewer === true ? <EmojiViewer handleEmojiClick={this.handleEmojiClick}/> : <div />}
                <MessageForm value={this.state.value} handleSubmit={(event) => this.handleSubmit(event)} 
                                                        handleFileUpload={(event) => this.handleFileUpload(event)} 
                                                        handleGeoposition={(event) => this.handleGeoposition(event)}
                                                        handleChange={(event) => this.handleChange(event)}
                                                        handleOpenEmojiViewer={(event) => this.handleOpenEmojiViewer(event)}/>
            
            </div>

        );
    };
}

const mapDispatchToProps = (dispatch) => {
    return    {
        AddMessage: (id, message, author, chatId, filename, url) => dispatch(actions.addMessage(id, message, author, chatId, filename, url))
    }
};

const mapStateToProps = state => {
    return {
        currentUsr: state.usr.currentUser,
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(AddMessage);
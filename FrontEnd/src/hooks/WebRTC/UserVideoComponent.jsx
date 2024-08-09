// UserVideoComponent.jsx
import React, { Component } from 'react';
import OpenViduVideoComponent from './OvVideo';
import "./UserVideo.css";  // 현재 파일과 같은 디렉토리에 있는 경우

export default class UserVideoComponent extends Component {

    getNicknameTag() {
        // 사용자 닉네임을 가져옵니다.
        return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
    }

    render() {
        return (
            <div>
                {this.props.streamManager !== undefined ? (
                    <div className="streamcomponent">
                        <OpenViduVideoComponent streamManager={this.props.streamManager} />
                        <div><p>{this.getNicknameTag()}</p></div>
                    </div>
                ) : null}
            </div>
        );
    }
}

// MissionVideoComponent.jsx
import React, { Component } from 'react';
import MissionVideo from './MissionVideo';
import "./UserVideo.css";  
import { UndoIcon } from 'lucide-react';

export default class MissionVideoComponent extends Component {

    getNicknameTag() {
        // 사용자 닉네임을 가져옵니다.
        return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
    }

    subscribers(){
        const publisher = this.props.username;
        const subscriber = this.getNicknameTag();
        return publisher !== subscriber;
    }

    render() {
        if (this.props.streamManager === undefined || !this.subscribers()){
            return null;
        }

        return (
            <div>
                {/* {this.props.streamManager !== undefined ? ( */}
                    <div className="streamcomponent">
                        <MissionVideo 
                            style={{ height: "70%" }}
                            streamManager={this.props.streamManager}
                        />
                        <div><p>{this.getNicknameTag()}</p></div>
                    </div>
                {/* ) : null} */}
            </div>
        );
    }
}

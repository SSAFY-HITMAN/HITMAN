// UserVideoComponent.jsx
import React, { Component } from "react";
import OpenViduVideoComponent from "./OvVideo";
import "./UserVideo.css";
import { UndoIcon } from "lucide-react";

export default class UserVideoComponent extends Component {
  getNicknameTag() {
    // 사용자 닉네임을 가져옵니다.
    return JSON.parse(this.props.streamManager.stream.connection.data)
      .clientData;
  }

  subscribers() {
    const publisher = this.props.username;
    const subscriber = this.getNicknameTag();
    return publisher !== subscriber;
  }

  render() {
    if (this.props.streamManager === undefined || !this.subscribers()) {
      return null;
    }

    return (
      <div>
        {/* {this.props.streamManager !== undefined ? ( */}
        <div className="streamcomponent">
          <div className="h-[40vh]"></div>
          <OpenViduVideoComponent
            streamManager={this.props.streamManager}
            className="h-[40vh]"
          />
          <div>
            <p>{this.getNicknameTag()}</p>
          </div>
        </div>
        {/* ) : null} */}
      </div>
    );
  }
}

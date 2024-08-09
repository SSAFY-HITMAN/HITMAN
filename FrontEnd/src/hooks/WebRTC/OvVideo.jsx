// OvVideo.jsx
import React, { Component } from 'react';

export default class OpenViduVideoComponent extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        // streamManager prop이 변경될 때마다 비디오 요소에 스트림 연결
        if (prevProps.streamManager !== this.props.streamManager && !!this.videoRef.current) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
            this.applyVideoInversion(); // 좌우 반전 적용
        }
    }

    componentDidMount() {
        // 컴포넌트가 마운트될 때 스트림을 비디오 요소에 연결
        if (this.props && !!this.videoRef.current) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
            this.applyVideoInversion(); // 좌우 반전 적용
        }
    }

    render() {
        // 비디오 요소 생성 및 ref 연결
        return <video autoPlay={true} ref={this.videoRef} style={{ width: '100%', height: 'auto' }} />;
    }
}
